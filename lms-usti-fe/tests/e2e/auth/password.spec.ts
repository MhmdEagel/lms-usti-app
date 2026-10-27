import { test, expect } from "../../fixtures/roles";
import { ACCOUNTS } from "../../helpers/accounts";
import { passwordInput } from "../../helpers/ui";

/**
 * TC-PWD — Ubah Password di Pengaturan (P2)
 *
 * Partisi ekivalen (changePasswordSchema):
 *  1. New < 8 char → "Password minimal 8 karakter"
 *  2. New tanpa huruf besar/angka → regex message
 *  3. Confirm != new → "Konfirmasi password tidak cocok"
 *  4. Old kosong → "Password lama wajib diisi"
 *
 * Partisi "valid" tidak ditulis sebagai test otomatis karena submit valid
 * memicu pengiriman OTP email sungguhan — biarkan sebagai manual test.
 */

test.describe("Ubah Password", () => {
  test.beforeEach(async ({ dosenPage }) => {
    await dosenPage.goto("/dosen/pengaturan");
    // Klik tab Keamanan
    await dosenPage.getByText("Pengaturan kata sandi dan keamanan").click();
  });

  // TC-PWD-02
  test("Mengubah password dengan password baru yang terlalu pendek", async ({
    dosenPage,
  }) => {
    await passwordInput(dosenPage, "old_password").fill(ACCOUNTS.dosen.password);
    await passwordInput(dosenPage, "new_password").fill("Ab1");
    await passwordInput(dosenPage, "confirmPassword").fill("Ab1");
    await dosenPage.getByRole("button", { name: "Ubah Password" }).click();

    await expect(
      dosenPage.getByText("Password minimal 8 karakter"),
    ).toBeVisible();
  });

  // TC-PWD-03
  test(
    "Mengubah password dengan password baru tanpa huruf besar dan angka",
    async ({ dosenPage }) => {
      await passwordInput(dosenPage, "old_password").fill(ACCOUNTS.dosen.password);
      await passwordInput(dosenPage, "new_password").fill("abcdefghij");
      await passwordInput(dosenPage, "confirmPassword").fill("abcdefghij");
      await dosenPage.getByRole("button", { name: "Ubah Password" }).click();

      await expect(
        dosenPage.getByText(
          "Password harus mengandung minimal satu huruf besar dan satu angka",
        ),
      ).toBeVisible();
    },
  );

  // TC-PWD-04
  test("Mengubah password dengan konfirmasi password yang tidak sama", async ({
    dosenPage,
  }) => {
    await passwordInput(dosenPage, "old_password").fill(ACCOUNTS.dosen.password);
    await passwordInput(dosenPage, "new_password").fill("Baru1234");
    await passwordInput(dosenPage, "confirmPassword").fill("Bedanya1");
    await dosenPage.getByRole("button", { name: "Ubah Password" }).click();

    await expect(
      dosenPage.getByText("Konfirmasi password tidak cocok"),
    ).toBeVisible();
  });

  // TC-PWD-05
  test("Mengubah password dengan password lama yang kosong", async ({
    dosenPage,
  }) => {
    await passwordInput(dosenPage, "new_password").fill("Baru1234");
    await passwordInput(dosenPage, "confirmPassword").fill("Baru1234");
    await dosenPage.getByRole("button", { name: "Ubah Password" }).click();

    await expect(
      dosenPage.getByText("Password lama wajib diisi"),
    ).toBeVisible();
  });
});
