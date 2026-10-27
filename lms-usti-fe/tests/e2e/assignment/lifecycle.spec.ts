import { test, expect } from "../../fixtures/roles";
import { ACCOUNTS } from "../../helpers/accounts";
import {
  apiLogin,
  apiCreateClassroom,
  apiJoinClassroom,
  apiFindAssignments,
} from "../../helpers/api";
import { uniqueName } from "../../helpers/ui";

/**
 * TC-LIFECYCLE — Alur lengkap tugas (P1)
 * dosen buat kelas (API) → dosen buat tugas (UI) → mahasiswa join (API)
 * → mahasiswa kumpulkan (UI) → dosen nilai (UI) → toast nilai tersimpan
 *
 * Setup memakai API agar hemat waktu; UI dipakai untuk alur yang sedang diuji.
 */

test.describe("Data Tugas", () => {
  test(
    "Melakukan pengumpulan tugas dari mahasiswa dan penilaian dari dosen",
    async ({ dosenPage, mahasiswaPage, request }) => {
      test.setTimeout(180_000);

      const assignmentTitle = uniqueName("Tugas QA");

      // ── Setup: kelas + join via API ─────────────────────────────
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

      // ── 1. Dosen membuat tugas via UI ──────────────────────────
      await dosenPage.goto(`/dosen/kelas/${classroom.id}/tugas`);
      await dosenPage.getByRole("button", { name: "Tambah Tugas" }).click();

      // overlay "Buat Tugas" terbuka (custom div, bukan radix dialog)
      await expect(dosenPage.getByText("Buat Tugas")).toBeVisible();
      await dosenPage.getByLabel("Judul").fill(assignmentTitle);
      await dosenPage.locator('[contenteditable="true"]').first().click();
      await dosenPage.keyboard.type("Kerjakan soal nomor 1 sampai 5.");
      await dosenPage.getByRole("button", { name: "Simpan" }).click();

      await expect(
        dosenPage.getByText("Berhasil menambahkan tugas"),
      ).toBeVisible({ timeout: 15_000 });
      // list di-refresh server-side via router.refresh() — beri margin waktu
      await expect(dosenPage.getByText(assignmentTitle).first()).toBeVisible({
        timeout: 15_000,
      });

      // ── 2. Ambil assignmentId via API ──────────────────────────
      const assignments = await apiFindAssignments(
        request,
        dosenToken,
        classroom.id,
      );
      const assignment = assignments.find((a) => a.title === assignmentTitle);
      expect(assignment, "assignment harus tersimpan di backend").toBeTruthy();
      const assignmentId = assignment!.id;

      // ── 3. Mahasiswa kumpulkan tugas via UI (link) ─────────────
      await mahasiswaPage.goto(
        `/mahasiswa/kelas/${classroom.id}/tugas/${assignmentId}`,
      );
      await mahasiswaPage
        .getByRole("button", { name: "Unggah Tugas" })
        .click();
      await expect(mahasiswaPage.getByText("Kumpulkan Tugas")).toBeVisible();

      await mahasiswaPage.getByRole("button", { name: "Link" }).click();
      const linkDialog = mahasiswaPage
        .getByRole("dialog")
        .filter({ hasText: "Upload Link" });
      await expect(linkDialog).toBeVisible();
      // Catatan: kedua input di AddLinkDialog memakai id "link-string" yang sama,
      // jadi pakai indeks berdasarkan urutan (Nama Link, Link Url).
      const linkInputs = linkDialog.locator("input");
      await linkInputs.nth(0).fill("Jawaban Tugas");
      await linkInputs.nth(1).fill("https://www.example.com/jawaban");
      await linkDialog.getByRole("button", { name: "Tambah Link" }).click();
      await expect(linkDialog).toBeHidden();

      await mahasiswaPage
        .getByRole("button", { name: "Kumpulkan", exact: true })
        .click();
      await expect(
        mahasiswaPage.getByText("Tugas berhasil dikumpulkan"),
      ).toBeVisible({
        timeout: 15_000,
      });

      // ── 4. Dosen menilai via UI ────────────────────────────────
      await dosenPage.goto(
        `/dosen/kelas/${classroom.id}/tugas/${assignmentId}/penilaian`,
      );
      // pilih baris mahasiswa yang berstatus "Belum dinilai"
      const submissionRow = dosenPage
        .locator("div.cursor-pointer")
        .filter({ hasText: "Belum dinilai" })
        .first();
      await expect(submissionRow).toBeVisible({ timeout: 15_000 });
      await submissionRow.click();

      // form nilai muncul di kartu "Nilai"
      await expect(dosenPage.getByPlaceholder("Tulis nilai")).toBeVisible();
      await dosenPage.getByPlaceholder("Tulis nilai").fill("90");
      await dosenPage
        .getByPlaceholder("Tulis umpan balik...")
        .fill("Kerja bagus");
      await dosenPage.getByRole("button", { name: "Simpan" }).click();

      await expect(dosenPage.getByText("Nilai berhasil disimpan")).toBeVisible({
        timeout: 15_000,
      });
    },
  );
});
