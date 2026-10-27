import { test, expect } from "../../fixtures/roles";
import { ACCOUNTS } from "../../helpers/accounts";
import {
  apiLogin,
  apiCreateClassroom,
  apiJoinClassroom,
  apiCreateAssignment,
  type ApiAssignment,
  type ApiClassroom,
} from "../../helpers/api";
import type { APIRequestContext } from "@playwright/test";

/**
 * TC-SUBMIT — Pengumpulan tugas mahasiswa (P1)
 *
 * Partisi ekivalen (SubmitAssignmentDialog + useSubmitAssignmentDialog):
 *  1. Valid: lampiran file PDF kecil → "Tugas berhasil dikumpulkan",
 *     trigger berubah jadi "Edit Pengumpulan" (partisi resubmit)
 *  2. Empty state: tanpa lampiran → tombol "Kumpulkan" disabled
 *  3. Lampiran tipe tidak diizinkan (.exe) → ditolak backend
 *     → toast "File gagal diupload", chip tidak muncul
 *  4. Lampiran terlalu besar (> 10 MB) → TIDAK ada guard client di
 *     submission (berbeda dengan material) → ditolak backend
 *     → toast "File gagal diupload"
 *  5. Deadline terlewat + late_submission "not_allowed" → alert blokir
 *     + tombol "Kumpulkan" disabled
 *
 * Setup (kelas + tugas + join) via API agar hemat waktu; UI dipakai untuk
 * alur yang sedang diuji.
 */

const SMALL_PDF = {
  name: "jawaban-tugas.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n% fake pdf untuk e2e\n"),
};

const EXE_FILE = {
  name: "malware.exe",
  mimeType: "application/octet-stream",
  buffer: Buffer.from("MZ fake exe untuk e2e"),
};

// 11 MB — di atas limit backend MAX_FILE_SIZE (10 MB). Client submission
// tidak punya guard ukuran, jadi file benar-benar dikirim lalu ditolak.
const OVERSIZED_PDF = {
  name: "jawaban-besar.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.alloc(11 * 1024 * 1024),
};

interface SeedResult {
  classroom: ApiClassroom;
  assignment: ApiAssignment;
}

/** Seed kelas + tugas (dosen) dan join mahasiswa via API. */
async function seedClassroomWithAssignment(
  request: APIRequestContext,
  overrides: Parameters<typeof apiCreateAssignment>[3] = {},
): Promise<SeedResult> {
  const dosenToken = await apiLogin(
    request,
    ACCOUNTS.dosen.email,
    ACCOUNTS.dosen.password,
  );
  const classroom = await apiCreateClassroom(request, dosenToken);

  const mahasiswaToken = await apiLogin(
    request,
    ACCOUNTS.mahasiswa.email,
    ACCOUNTS.mahasiswa.password,
  );
  await apiJoinClassroom(request, mahasiswaToken, classroom.class_code);

  const assignment = await apiCreateAssignment(
    request,
    dosenToken,
    classroom.id,
    overrides,
  );
  return { classroom, assignment };
}

const EMPTY_STATE_TEXT =
  "Belum ada lampiran. Klik tombol Upload atau Link untuk menambahkan.";

test.describe("Pengumpulan Tugas Mahasiswa", () => {
  test.beforeEach(() => {
    test.setTimeout(120_000);
  });

  // TC-SUBMIT-01 (partisi valid + resubmit)
  test("Mengumpulkan tugas dengan lampiran file yang valid", async ({
    mahasiswaPage,
    request,
  }) => {
    const { classroom, assignment } = await seedClassroomWithAssignment(
      request,
    );

    await mahasiswaPage.goto(
      `/mahasiswa/kelas/${classroom.id}/tugas/${assignment.id}`,
    );
    await mahasiswaPage
      .getByRole("button", { name: "Unggah Tugas" })
      .click();
    await expect(mahasiswaPage.getByText("Kumpulkan Tugas")).toBeVisible();

    await mahasiswaPage
      .locator('input[type="file"]')
      .first()
      .setInputFiles(SMALL_PDF);
    await expect(
      mahasiswaPage.getByText("File berhasil diupload"),
    ).toBeVisible({ timeout: 15_000 });
    // chip lampiran muncul
    await expect(
      mahasiswaPage.getByText(SMALL_PDF.name).first(),
    ).toBeVisible();

    await mahasiswaPage
      .getByRole("button", { name: "Kumpulkan", exact: true })
      .click();
    await expect(
      mahasiswaPage.getByText("Tugas berhasil dikumpulkan"),
    ).toBeVisible({ timeout: 15_000 });

    // setelah refresh, status submitted → trigger berubah jadi Edit
    await expect(
      mahasiswaPage.getByRole("button", { name: "Edit Pengumpulan" }),
    ).toBeVisible({ timeout: 15_000 });
  });

  // TC-SUBMIT-02 (partisi empty state)
  test("Membuka dialog kumpulkan tanpa lampiran", async ({
    mahasiswaPage,
    request,
  }) => {
    const { classroom, assignment } = await seedClassroomWithAssignment(
      request,
    );

    await mahasiswaPage.goto(
      `/mahasiswa/kelas/${classroom.id}/tugas/${assignment.id}`,
    );
    await mahasiswaPage
      .getByRole("button", { name: "Unggah Tugas" })
      .click();

    await expect(mahasiswaPage.getByText("Kumpulkan Tugas")).toBeVisible();
    await expect(mahasiswaPage.getByText(EMPTY_STATE_TEXT)).toBeVisible();
    await expect(
      mahasiswaPage.getByRole("button", { name: "Kumpulkan", exact: true }),
    ).toBeDisabled();
  });

  // TC-SUBMIT-03 (partisi: tipe file tidak diizinkan)
  test("Mengumpulkan tugas dengan lampiran file yang tipe-nya tidak diizinkan", async ({
    mahasiswaPage,
    request,
  }) => {
    const { classroom, assignment } = await seedClassroomWithAssignment(
      request,
    );

    await mahasiswaPage.goto(
      `/mahasiswa/kelas/${classroom.id}/tugas/${assignment.id}`,
    );
    await mahasiswaPage
      .getByRole("button", { name: "Unggah Tugas" })
      .click();
    await expect(mahasiswaPage.getByText("Kumpulkan Tugas")).toBeVisible();

    // .exe dikirim ke backend lalu ditolak ValidateFile
    await mahasiswaPage
      .locator('input[type="file"]')
      .first()
      .setInputFiles(EXE_FILE);

    await expect(
      mahasiswaPage.getByText("File gagal diupload").first(),
    ).toBeVisible({ timeout: 15_000 });
    // chip tidak bertambah → empty state masih tampil, Kumpulkan disabled
    await expect(mahasiswaPage.getByText(EMPTY_STATE_TEXT)).toBeVisible();
    await expect(
      mahasiswaPage.getByRole("button", { name: "Kumpulkan", exact: true }),
    ).toBeDisabled();
  });

  // TC-SUBMIT-04 (partisi: file terlalu besar — guard ada di backend)
  test("Mengumpulkan tugas dengan lampiran file yang terlalu besar", async ({
    mahasiswaPage,
    request,
  }) => {
    const { classroom, assignment } = await seedClassroomWithAssignment(
      request,
    );

    await mahasiswaPage.goto(
      `/mahasiswa/kelas/${classroom.id}/tugas/${assignment.id}`,
    );
    await mahasiswaPage
      .getByRole("button", { name: "Unggah Tugas" })
      .click();
    await expect(mahasiswaPage.getByText("Kumpulkan Tugas")).toBeVisible();

    // tidak ada guard client → upload benar-benar dikirim (11 MB > 10 MB)
    await mahasiswaPage
      .locator('input[type="file"]')
      .first()
      .setInputFiles(OVERSIZED_PDF);

    await expect(
      mahasiswaPage.getByText("File gagal diupload").first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      mahasiswaPage.getByRole("button", { name: "Kumpulkan", exact: true }),
    ).toBeDisabled();
  });

  // TC-SUBMIT-05 (partisi: deadline terlewat + late_submission not_allowed)
  test("Mengumpulkan tugas setelah deadline dengan late submission tidak diizinkan", async ({
    mahasiswaPage,
    request,
  }) => {
    // deadline 1 jam yang lalu (UTC/RFC3339), backend tidak validasi masa depan
    const pastDeadline = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { classroom, assignment } = await seedClassroomWithAssignment(
      request,
      { deadline: pastDeadline, late_submission: "not_allowed" },
    );

    await mahasiswaPage.goto(
      `/mahasiswa/kelas/${classroom.id}/tugas/${assignment.id}`,
    );
    await mahasiswaPage
      .getByRole("button", { name: "Unggah Tugas" })
      .click();

    await expect(
      mahasiswaPage.getByText(
        "Tugas ini sudah melewati batas pengumpulan. Pengumpulan tidak diterima.",
      ),
    ).toBeVisible();
    await expect(
      mahasiswaPage.getByRole("button", { name: "Kumpulkan", exact: true }),
    ).toBeDisabled();
  });
});
