import { test, expect } from "../../fixtures/roles";
import { ACCOUNTS } from "../../helpers/accounts";
import {
  apiLogin,
  apiCreateClassroom,
  apiJoinClassroom,
  apiCreateAssignment,
  apiSubmitAssignment,
  type ApiAssignment,
  type ApiClassroom,
} from "../../helpers/api";
import type { APIRequestContext, Page } from "@playwright/test";

/**
 * TC-GRADE — Penilaian tugas (dosen) (P1)
 *
 * Partisi ekivalen (GradingCard + gradeSchema + backend Grade):
 *  1. Valid: score 0–100 + feedback → "Nilai berhasil disimpan",
 *     badge row berubah jadi "Sudah dinilai" + nilai tampil di list
 *  2. Score > 100 → guard client (gradeSchema.max(100))
 *     → toast "Nilai tidak boleh lebih dari 100", nilai tidak tersimpan
 *  3. Mahasiswa belum mengirim → warning "Mahasiswa belum mengirim tugas",
 *     input nilai tidak dirender
 *  4. Regrade: nilai sudah ada → input ter-prefill nilai lama,
 *     ubah & simpan lagi → nilai ter-update
 *
 * Setup (kelas + tugas + join + submit) via API; UI dipakai untuk alur
 * penilaian yang sedang diuji. Halaman: /dosen/kelas/{id}/tugas/{aid}/penilaian
 */

interface SeedResult {
  classroom: ApiClassroom;
  assignment: ApiAssignment;
}

/**
 * Seed kelas + tugas (dosen) + join mahasiswa (API).
 * @param submit true → mahasiswa juga mengumpulkan via API (link).
 *               false → hanya join, submission berstatus "belum mengirim".
 */
async function seedForGrading(
  request: APIRequestContext,
  submit: boolean,
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
  );

  if (submit) {
    await apiSubmitAssignment(
      request,
      mahasiswaToken,
      classroom.id,
      assignment.id,
    );
  }
  return { classroom, assignment };
}

/** Buka halaman penilaian dan pilih baris mahasiswa berdasar badge status. */
async function openGradingAndSelect(
  dosenPage: Page,
  classroomId: string,
  assignmentId: string,
  statusBadge: "Belum dinilai" | "Sudah dinilai" | "Belum mengirim",
) {
  await dosenPage.goto(
    `/dosen/kelas/${classroomId}/tugas/${assignmentId}/penilaian`,
  );
  const row = dosenPage
    .locator("div.cursor-pointer")
    .filter({ hasText: statusBadge })
    .first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.click();
}

test.describe("Penilaian Tugas", () => {
  test.beforeEach(() => {
    test.setTimeout(120_000);
  });

  // TC-GRADE-01 (partisi valid)
  test("Menilai pengumpulan mahasiswa dengan nilai dan umpan balik yang valid", async ({
    dosenPage,
    request,
  }) => {
    const { classroom, assignment } = await seedForGrading(request, true);

    await openGradingAndSelect(
      dosenPage,
      classroom.id,
      assignment.id,
      "Belum dinilai",
    );

    await dosenPage.getByPlaceholder("Tulis nilai").fill("85");
    await dosenPage
      .getByPlaceholder("Tulis umpan balik...")
      .fill("Kerja bagus, pertahankan");
    await dosenPage.getByRole("button", { name: "Simpan" }).click();

    await expect(
      dosenPage.getByText("Nilai berhasil disimpan"),
    ).toBeVisible({ timeout: 15_000 });
    // row berubah: badge "Sudah dinilai" + nilai tampil
    const gradedRow = dosenPage
      .locator("div.cursor-pointer")
      .filter({ hasText: "Sudah dinilai" })
      .first();
    await expect(gradedRow).toBeVisible({ timeout: 15_000 });
    await expect(gradedRow).toContainText("85");
  });

  // TC-GRADE-02 (partisi: score di atas batas — guard client)
  test("Menilai pengumpulan mahasiswa dengan nilai lebih dari 100", async ({
    dosenPage,
    request,
  }) => {
    const { classroom, assignment } = await seedForGrading(request, true);

    await openGradingAndSelect(
      dosenPage,
      classroom.id,
      assignment.id,
      "Belum dinilai",
    );

    await dosenPage.getByPlaceholder("Tulis nilai").fill("150");
    await dosenPage.getByRole("button", { name: "Simpan" }).click();

    await expect(
      dosenPage.getByText("Nilai tidak boleh lebih dari 100"),
    ).toBeVisible();
    // gagal client-side → status di list tidak berubah
    await expect(
      dosenPage
        .locator("div.cursor-pointer")
        .filter({ hasText: "Belum dinilai" })
        .first(),
    ).toBeVisible();
  });

  // TC-GRADE-03 (partisi: mahasiswa belum mengirim)
  test("Memilih mahasiswa yang belum mengirim tugas", async ({
    dosenPage,
    request,
  }) => {
    const { classroom, assignment } = await seedForGrading(request, false);

    await openGradingAndSelect(
      dosenPage,
      classroom.id,
      assignment.id,
      "Belum mengirim",
    );

    // warning tampil, input nilai + tombol Simpan tidak dirender
    await expect(
      dosenPage.getByText("Mahasiswa belum mengirim tugas"),
    ).toBeVisible();
    await expect(dosenPage.getByPlaceholder("Tulis nilai")).toBeHidden();
    await expect(
      dosenPage.getByRole("button", { name: "Simpan" }),
    ).toBeHidden();
  });

  // TC-GRADE-04 (partisi: regrade — nilai sudah ada)
  test("Mengubah nilai yang sudah tersimpan", async ({
    dosenPage,
    request,
  }) => {
    const { classroom, assignment } = await seedForGrading(request, true);

    // nilai awal 70 via UI
    await openGradingAndSelect(
      dosenPage,
      classroom.id,
      assignment.id,
      "Belum dinilai",
    );
    await dosenPage.getByPlaceholder("Tulis nilai").fill("70");
    await dosenPage.getByRole("button", { name: "Simpan" }).click();
    await expect(
      dosenPage.getByText("Nilai berhasil disimpan"),
    ).toBeVisible({ timeout: 15_000 });

    // pilih lagi → input ter-prefill "70", ubah jadi 92
    const gradedRow = dosenPage
      .locator("div.cursor-pointer")
      .filter({ hasText: "Sudah dinilai" })
      .first();
    await expect(gradedRow).toBeVisible({ timeout: 15_000 });
    await gradedRow.click();

    const scoreInput = dosenPage.getByPlaceholder("Tulis nilai");
    await expect(scoreInput).toHaveValue("70");
    await scoreInput.fill("92");
    await dosenPage.getByRole("button", { name: "Simpan" }).click();

    await expect(
      dosenPage.getByText("Nilai berhasil disimpan"),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      dosenPage
        .locator("div.cursor-pointer")
        .filter({ hasText: "Sudah dinilai" })
        .first(),
    ).toContainText("92", { timeout: 15_000 });
  });
});
