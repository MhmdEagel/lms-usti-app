import { test, expect } from "../../fixtures/roles";
import { homePattern } from "../../helpers/accounts";

/**
 * TC-RBAC — Role-Based Access Control / middleware (P0)
 *
 * Partisi ekivalen (lihat src/middleware.ts):
 *  1. Tanpa cookie + route protected → redirect ke /auth/login + callbackUrl
 *  2. Tanpa cookie + route auth → bisa diakses
 *  3. Role cocok dengan prefix → akses diterima
 *  4. Role tidak cocok dengan prefix → redirect ke home sendiri
 *
 * Prinsip EP: cukup 1 test per partisi, tanpa perlu menguji
 * semua kombinasi prefix × role.
 */

test.describe("Akses Halaman Tanpa Login", () => {
  // TC-RBAC-01
  test(
    "Mengakses halaman dashboard ketika belum login",
    { tag: "@smoke" },
    async ({ page }) => {
      await page.goto("/mahasiswa");

      await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=/);
      await expect(page.getByRole("heading", { name: "Masuk" })).toBeVisible();
    },
  );

  // TC-RBAC-02
  test(
    "Mengakses halaman login ketika belum login",
    { tag: "@smoke" },
    async ({ page }) => {
      await page.goto("/auth/login");

      await expect(page).toHaveURL("/auth/login");
      await expect(page.getByRole("heading", { name: "Masuk" })).toBeVisible();
    },
  );
});

/**
 * Partisi tambahan: authenticated user mengakses route auth (/auth/*).
 * Middleware me-redirect ke home sesuai role.
 */

/**
 * Partisi role × prefix. Tiap role cukup diuji dengan:
 *  - 1 prefix yang cocok (valid partition)
 *  - 1 prefix yang tidak cocok (invalid partition, redirect ke home)
 */
const ROLE_CASES = [
  {
    role: "mahasiswa",
    home: "/mahasiswa",
    wrongPage: "admin",
    wrongPath: "/admin",
  },
  { role: "dosen", home: "/dosen", wrongPage: "prodi", wrongPath: "/prodi" },
  { role: "prodi", home: "/prodi", wrongPage: "dosen", wrongPath: "/dosen" },
] as const;

for (const { role, home, wrongPage, wrongPath } of ROLE_CASES) {
  test.describe(`Halaman ${role.charAt(0).toUpperCase()}${role.slice(1)}`, () => {
    // TC-RBAC-03
    test(
      `Mengakses halaman ${role} dengan akun ${role}`,
      { tag: "@smoke" },
      async ({ mahasiswaPage, dosenPage, prodiPage }) => {
        const pages = {
          mahasiswa: mahasiswaPage,
          dosen: dosenPage,
          prodi: prodiPage,
        } as const;
        const page = pages[role];
        await page.goto(home);
        await expect(page).toHaveURL(homePattern(home));
        // pastikan bukan redirect ke login
        expect(page.url()).not.toContain("/auth/login");
      },
    );

    // TC-RBAC-04
    test(
      `Mengakses halaman ${wrongPage} dengan akun ${role}`,
      { tag: "@smoke" },
      async ({ mahasiswaPage, dosenPage, prodiPage }) => {
        const pages = {
          mahasiswa: mahasiswaPage,
          dosen: dosenPage,
          prodi: prodiPage,
        } as const;
        const page = pages[role];
        await page.goto(wrongPath);
        await expect(page).toHaveURL(homePattern(home), {
          timeout: 20_000,
        });
      },
    );
  });
}
