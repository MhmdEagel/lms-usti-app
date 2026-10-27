import { test, expect } from "../../fixtures/roles";
import { ACCOUNTS } from "../../helpers/accounts";
import { apiLogin, apiCreateClassroom } from "../../helpers/api";
import { uniqueName } from "../../helpers/ui";

/**
 * TC-MATERIAL — Materi (dosen) (P1)
 *
 * Partisi ekivalen:
 *  1. Valid: judul terisi + lampiran file valid → "Berhasil menambahkan materi"
 *  2. Lampiran file dengan tipe tidak diizinkan (.exe) → ditolak backend
 *     → toast "File gagal diupload", chip lampiran tidak muncul
 *  3. Lampiran file terlalu besar (≥ 1 MB) → ditolak client (isSizeLimit)
 *     → toast "File melebihi batas upload. Max 1 MB", tanpa request upload
 *  4. Lampiran link tidak valid → toast "Link tidak valid", dialog tetap buka
 *
 * Catatan: input file memakai `accept`, tapi Playwright setInputFiles
 * melewati accept — ini disengaja untuk menguji partisi invalid.
 */

// Buffer PDF kecil — backend hanya memvalidasi ekstensi + ukuran, bukan konten.
const SMALL_PDF = {
  name: "materi-qa.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n% fake pdf untuk e2e\n"),
};

const EXE_FILE = {
  name: "malware.exe",
  mimeType: "application/octet-stream",
  buffer: Buffer.from("MZ fake exe untuk e2e"),
};

// 1,5 MB — melewati guard client isSizeLimit (≥ 1 MB), sengaja di atas
// boundary (EP, bukan BVA).
const OVERSIZED_PDF = {
  name: "materi-besar.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.alloc(1.5 * 1024 * 1024),
};

test.describe("Data Materi", () => {
  // TC-MATERIAL-01 (partisi valid, kini termasuk lampiran file valid)
  test("Menambah materi dengan data yang valid", async ({
    dosenPage,
    request,
  }) => {
    const title = uniqueName("Materi QA");

    // seed kelas via API
    const token = await apiLogin(
      request,
      ACCOUNTS.dosen.email,
      ACCOUNTS.dosen.password,
    );
    const classroom = await apiCreateClassroom(request, token);

    await dosenPage.goto(`/dosen/kelas/${classroom.id}/materi`);
    await dosenPage.getByRole("button", { name: "Tambah Materi" }).click();

    // overlay "Buat Materi" terbuka (custom div)
    await expect(dosenPage.getByText("Buat Materi")).toBeVisible();
    await dosenPage.getByLabel("Judul").fill(title);

    // lampiran file valid (PDF kecil)
    await dosenPage.locator('input[type="file"]').first().setInputFiles(SMALL_PDF);
    await expect(
      dosenPage.getByText("File berhasil diupload"),
    ).toBeVisible({ timeout: 15_000 });
    // chip lampiran muncul dengan nama file
    await expect(dosenPage.getByText(SMALL_PDF.name).first()).toBeVisible();

    await dosenPage.getByRole("button", { name: "Simpan" }).click();

    await expect(
      dosenPage.getByText("Berhasil menambahkan materi"),
    ).toBeVisible({ timeout: 15_000 });
    await expect(dosenPage.getByText(title).first()).toBeVisible();
  });

  // TC-MATERIAL-02 (partisi: tipe file tidak diizinkan)
  test("Menambah materi dengan lampiran file yang tipe-nya tidak diizinkan", async ({
    dosenPage,
    request,
  }) => {
    const token = await apiLogin(
      request,
      ACCOUNTS.dosen.email,
      ACCOUNTS.dosen.password,
    );
    const classroom = await apiCreateClassroom(request, token);

    await dosenPage.goto(`/dosen/kelas/${classroom.id}/materi`);
    await dosenPage.getByRole("button", { name: "Tambah Materi" }).click();
    await expect(dosenPage.getByText("Buat Materi")).toBeVisible();

    // .exe: tidak dicek client, dikirim ke backend lalu ditolak ValidateFile
    await dosenPage.locator('input[type="file"]').first().setInputFiles(EXE_FILE);

    await expect(
      dosenPage.getByText("File gagal diupload").first(),
    ).toBeVisible({ timeout: 15_000 });
    // chip lampiran tidak bertambah — empty state masih tampil
    await expect(
      dosenPage.getByText(
        "Belum ada lampiran. Klik tombol Upload atau Link untuk menambahkan.",
      ),
    ).toBeVisible();
  });

  // TC-MATERIAL-03 (partisi: file melebihi batas ukuran — guard client)
  test("Menambah materi dengan lampiran file yang terlalu besar", async ({
    dosenPage,
    request,
  }) => {
    const token = await apiLogin(
      request,
      ACCOUNTS.dosen.email,
      ACCOUNTS.dosen.password,
    );
    const classroom = await apiCreateClassroom(request, token);

    await dosenPage.goto(`/dosen/kelas/${classroom.id}/materi`);
    await dosenPage.getByRole("button", { name: "Tambah Materi" }).click();
    await expect(dosenPage.getByText("Buat Materi")).toBeVisible();

    // ditolak client sebelum upload (isSizeLimit ≥ 1 MB)
    await dosenPage
      .locator('input[type="file"]')
      .first()
      .setInputFiles(OVERSIZED_PDF);

    await expect(
      dosenPage.getByText("File melebihi batas upload. Max 1 MB"),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      dosenPage.getByText(
        "Belum ada lampiran. Klik tombol Upload atau Link untuk menambahkan.",
      ),
    ).toBeVisible();
  });

  // TC-MATERIAL-04 (partisi: link lampiran tidak valid)
  test("Menambah materi dengan link lampiran yang tidak valid", async ({
    dosenPage,
    request,
  }) => {
    const token = await apiLogin(
      request,
      ACCOUNTS.dosen.email,
      ACCOUNTS.dosen.password,
    );
    const classroom = await apiCreateClassroom(request, token);

    await dosenPage.goto(`/dosen/kelas/${classroom.id}/materi`);
    await dosenPage.getByRole("button", { name: "Tambah Materi" }).click();
    await expect(dosenPage.getByText("Buat Materi")).toBeVisible();

    await dosenPage.getByRole("button", { name: "Link" }).click();
    const linkDialog = dosenPage
      .getByRole("dialog")
      .filter({ hasText: "Upload Link" });
    await expect(linkDialog).toBeVisible();

    // Kedua input di AddLinkDialog memakai id "link-string" yang sama,
    // jadi pakai indeks: nth(0) = Nama Link, nth(1) = Link Url.
    const linkInputs = linkDialog.locator("input");
    await linkInputs.nth(0).fill("Referensi");
    await linkInputs.nth(1).fill("abc");
    await linkDialog.getByRole("button", { name: "Tambah Link" }).click();

    await expect(dosenPage.getByText("Link tidak valid")).toBeVisible();
    // dialog tidak tertutup — user masih bisa memperbaiki link
    await expect(linkDialog).toBeVisible();
  });
});
