import { test as base, type Page } from "@playwright/test";
import path from "path";
import { ACCOUNTS } from "../helpers/accounts";

/**
 * Fixtures untuk login per role.
 *
 * Setiap fixture membuat browser context baru dengan storageState
 * (cookie login) yang sudah di-login di global-setup, jadi test tidak
 * perlu login ulang tiap kali.
 *
 * Contoh:
 *   test("buat kelas", async ({ dosenPage }) => { ... });
 */

const AUTH_DIR = path.join(__dirname, "..", ".auth");

function roleFixture(role: keyof typeof ACCOUNTS) {
  return async (
    { browser }: { browser: import("@playwright/test").Browser },
    use: (page: Page) => Promise<void>,
  ) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, `${role}.json`),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  };
}

export const test = base.extend<{
  mahasiswaPage: Page;
  dosenPage: Page;
  prodiPage: Page;
}>({
  mahasiswaPage: roleFixture("mahasiswa"),
  dosenPage: roleFixture("dosen"),
  prodiPage: roleFixture("prodi"),
});

export { expect } from "@playwright/test";
