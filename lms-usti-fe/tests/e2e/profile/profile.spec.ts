import { test, expect } from "../../fixtures/roles";

/**
 * TC-PROFILE — Edit profil (P2)
 *
 * Partisi ekivalen (updateProfileSchema di src/schemas/profile.ts):
 *  1. Valid: fullname non-kosong + email valid → "Profil berhasil diperbarui"
 *  2. Email format invalid → "Format email tidak valid"
 *
 * Catatan: fullname di isi ulang dengan nilai yang sudah ada (dibaca dari
 * form) agar data akun demo tidak berubah.
 */

test.describe("Profil Pengguna", () => {
  // TC-PROFILE-01
  test("Mengubah profil dengan data yang valid", async ({ mahasiswaPage }) => {
    await mahasiswaPage.goto("/mahasiswa/pengaturan");
    await mahasiswaPage.getByRole("button", { name: "Edit" }).click();

    const fullname = await mahasiswaPage
      .getByLabel("Nama Lengkap")
      .inputValue();
    expect(fullname.length).toBeGreaterThan(0);

    // isi ulang nilai yang sama (tidak mengubah data demo)
    await mahasiswaPage.getByLabel("Nama Lengkap").fill(fullname);
    await mahasiswaPage.getByRole("button", { name: "Simpan" }).click();

    await expect(
      mahasiswaPage.getByText("Profil berhasil diperbarui"),
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  // TC-PROFILE-02
  test("Mengubah profil dengan format email yang tidak valid", async ({
    mahasiswaPage,
  }) => {
    await mahasiswaPage.goto("/mahasiswa/pengaturan");
    await mahasiswaPage.getByRole("button", { name: "Edit" }).click();

    await mahasiswaPage.getByLabel("Email").fill("bukan-email");
    await mahasiswaPage.getByRole("button", { name: "Simpan" }).click();

    await expect(
      mahasiswaPage.getByText("Format email tidak valid"),
    ).toBeVisible();
  });
});
