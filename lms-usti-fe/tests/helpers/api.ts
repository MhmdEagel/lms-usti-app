import type { APIRequestContext } from "@playwright/test";
import { API_URL } from "./accounts";

/**
 * Helper untuk seeding & pembacaan data lewat backend API langsung.
 * Dipakai agar test E2E cukup menguji alur UI, bukan setup manual.
 *
 * Semua endpoint di sini dari router/api.go (backend Go).
 */

interface ApiEnvelope<T> {
  meta: { status: number; message: string };
  data: T;
}

async function unwrap<T>(res: {
  ok(): boolean;
  status(): number;
  json(): Promise<unknown>;
}): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok() || body.meta.status >= 400) {
    throw new Error(
      `API error ${res.status()}: ${body?.meta?.message ?? "unknown"}`,
    );
  }
  return body.data;
}

/** Login via backend API, return access_token. */
export async function apiLogin(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  });
  const data = await unwrap<{ access_token: string }>(res);
  return data.access_token;
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export interface ApiClassroom {
  id: string;
  class_code: string;
  class_name: string;
  [key: string]: unknown;
}

/**
 * Cari slot jadwal yang bebas secara deterministik.
 * Backend menolak kelas dengan hari + ruang + jam yang overlap (409),
 * dan input Nomor Ruangan di UI dibatasi max 16, jadi kombinasinya
 * dibuat acak lalu di-retry bila masih bentrok.
 */
function randomScheduleSlot() {
  const startHour = 7 + Math.floor(Math.random() * 9); // 07:00–15:00
  const endHour = startHour + 2;
  return {
    room_number: 1 + Math.floor(Math.random() * 16),
    day: 1 + Math.floor(Math.random() * 6), // Senin–Sabtu
    class_start: `2010-10-10T${String(startHour).padStart(2, "0")}:00:00.000Z`,
    class_end: `2010-10-10T${String(endHour).padStart(2, "0")}:00:00.000Z`,
  };
}

/** Create classroom via API (ACL: DOSEN). Waktu dikirim seperti FE: toISOTime. */
export async function apiCreateClassroom(
  request: APIRequestContext,
  token: string,
  overrides: Partial<{
    class_name: string;
    class_cover: string;
    term: number;
    room_number: number;
    day: number;
    class_start: string;
    class_end: string;
    prodi: string;
    tahun_ajaran: string;
  }> = {},
): Promise<ApiClassroom> {
  const class_name = overrides.class_name ?? `E2E Class ${Date.now()}`;
  const basePayload = {
    class_cover: "basic",
    class_name,
    term: overrides.term ?? 3,
    prodi: overrides.prodi ?? "Teknik Informatika",
    tahun_ajaran: overrides.tahun_ajaran ?? "2025/2026",
  };
  const hasFixedSlot =
    "room_number" in overrides ||
    "day" in overrides ||
    "class_start" in overrides ||
    "class_end" in overrides;

  // Retry dengan slot acak baru bila masih kena 409 jadwal bentrok.
  let body: ApiEnvelope<null> | null = null;
  let status = 0;
  for (let attempt = 0; attempt < 5; attempt++) {
    const payload = {
      ...basePayload,
      ...(hasFixedSlot ? overrides : { ...overrides, ...randomScheduleSlot() }),
    };
    const res = await request.post(`${API_URL}/classroom/create`, {
      headers: auth(token),
      data: payload,
    });
    status = res.status();
    body = (await res.json().catch(() => null)) as ApiEnvelope<null> | null;
    const conflict = body?.meta.message.includes("bentrok") ?? false;
    if (!conflict) break;
  }
  if (!body || body.meta.status >= 400) {
    throw new Error(`API error ${status}: ${body?.meta?.message ?? "unknown"}`);
  }

  // Backend mengembalikan data: null — ambil kelas yang baru dibuat lewat search.
  const created = await apiFindDosenClassroomByName(request, token, class_name);
  if (!created) {
    throw new Error(`Kelas "${class_name}" tidak ditemukan setelah dibuat`);
  }
  return created;
}

/** Join classroom via API (ACL: MAHASISWA). */
export async function apiJoinClassroom(
  request: APIRequestContext,
  token: string,
  classCode: string,
): Promise<unknown> {
  const res = await request.post(`${API_URL}/classroom/join`, {
    headers: auth(token),
    data: { class_code: classCode },
  });
  return unwrap<unknown>(res);
}

export interface ApiAssignment {
  id: string;
  title: string;
  [key: string]: unknown;
}

/** List assignments di satu classroom (tanpa ACL khusus, cukup login). */
export async function apiFindAssignments(
  request: APIRequestContext,
  token: string,
  classroomId: string,
): Promise<ApiAssignment[]> {
  const res = await request.get(
    `${API_URL}/classroom/${classroomId}/assignments`,
    { headers: auth(token) },
  );
  return unwrap<ApiAssignment[]>(res);
}

/**
 * Create assignment via API (ACL: DOSEN). Backend mengembalikan data: null,
 * jadi hasil dibaca ulang lewat apiFindAssignments.
 */
export async function apiCreateAssignment(
  request: APIRequestContext,
  token: string,
  classroomId: string,
  overrides: Partial<{
    title: string;
    instruction: string;
    deadline: string | null;
    late_submission: string;
  }> = {},
): Promise<ApiAssignment> {
  const title = overrides.title ?? `Tugas QA ${Date.now()}`;
  const res = await request.post(
    `${API_URL}/classroom/${classroomId}/assignments`,
    {
      headers: auth(token),
      data: {
        title,
        instruction: overrides.instruction ?? "<p>Instruksi E2E</p>",
        ...(overrides.deadline !== undefined
          ? { deadline: overrides.deadline }
          : {}),
        ...(overrides.late_submission !== undefined
          ? { late_submission: overrides.late_submission }
          : {}),
      },
    },
  );
  await unwrap<null>(res);

  const assignments = await apiFindAssignments(request, token, classroomId);
  const created = assignments.find((a) => a.title === title);
  if (!created) {
    throw new Error(`Assignment "${title}" tidak ditemukan setelah dibuat`);
  }
  return created;
}

/** Submit tugas via API (ACL: MAHASISWA). Link saja agar hemat waktu. */
export async function apiSubmitAssignment(
  request: APIRequestContext,
  token: string,
  classroomId: string,
  assignmentId: string,
  overrides: Partial<{
    name: string;
    type: "FILE" | "LINK";
    url: string;
    unique_name: string;
  }> = {},
): Promise<unknown> {
  const res = await request.post(
    `${API_URL}/classroom/${classroomId}/assignments/${assignmentId}/submissions`,
    {
      headers: auth(token),
      data: {
        attachments: [
          {
            name: overrides.name ?? "Jawaban",
            type: overrides.type ?? "LINK",
            url: overrides.url ?? "https://www.example.com/jawaban",
            unique_name: overrides.unique_name ?? "",
          },
        ],
      },
    },
  );
  return unwrap<unknown>(res);
}

/** Cari classroom milik dosen berdasarkan nama (untuk navigasi UI). */
export async function apiFindDosenClassroomByName(
  request: APIRequestContext,
  token: string,
  name: string,
): Promise<ApiClassroom | undefined> {
  const res = await request.get(
    `${API_URL}/classroom/dosen/classrooms?search=${encodeURIComponent(name)}`,
    { headers: auth(token) },
  );
  const list = await unwrap<ApiClassroom[]>(res);
  return list.find((c) => c.class_name === name);
}
