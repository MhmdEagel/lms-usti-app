import { test, expect } from "@playwright/test";
import { ACCOUNTS, homePattern } from "../../helpers/accounts";
import { passwordInput } from "../../helpers/ui";

/**
 * TC-AUTH — Login (P0)
 *
 * Partisi ekivalen untuk field email & password login (loginSchema):
 *  1. Valid  → email format valid + credential benar → redirect sesuai role
 *  2. Invalid format → email bukan format email → pesan "Email tidak sesuai"
 *  3. Empty  → email kosong → pesan "Email wajib diisi"
 *  4. Empty  → password kosong → pesan "Password tidak boleh kosong"
 *  5. Valid format tapi credential salah → pesan "email atau password salah"
 *
 * Prinsip EP: cukup 1 test per partisi, tidak perlu semua kombinasi.
 */

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  for (const [role, account] of Object.entries(ACCOUNTS)) {
    // TC-AUTH-01
    test(
      `Melakukan login sebagai ${role} dengan kredensial yang valid`,
      { tag: "@smoke" },
      async ({ page }) => {
        await page.getByLabel("Email").fill(account.email);
        await passwordInput(page, "password").fill(account.password);
        await page.getByRole("button", { name: "Login" }).click();

        await expect(page).toHaveURL(homePattern(account.home), {
          timeout: 30_000,
        });
      },
    );
  }

  // TC-AUTH-02
  test("Melakukan login dengan format email yang tidak valid", async ({
    page,
  }) => {
    await page.getByLabel("Email").fill("bukan-email");
    await passwordInput(page, "password").fill("apapun");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Email tidak sesuai")).toBeVisible();
  });

  // TC-AUTH-03
  test("Melakukan login dengan email yang kosong", async ({ page }) => {
    await passwordInput(page, "password").fill("apapun");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Email wajib diisi")).toBeVisible();
  });

  // TC-AUTH-04
  test("Melakukan login dengan kata sandi yang kosong", async ({ page }) => {
    await page.getByLabel("Email").fill("user@contoh.com");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Password wajib diisi")).toBeVisible();
  });

  // TC-AUTH-05
  test("Melakukan login dengan kata sandi yang salah", async ({ page }) => {
    await page.getByLabel("Email").fill(ACCOUNTS.dosen.email);
    await passwordInput(page, "password").fill("password-salah");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("email atau password salah")).toBeVisible();
  });
});
