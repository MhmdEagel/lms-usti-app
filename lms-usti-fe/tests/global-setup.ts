import { chromium } from "@playwright/test";
import path from "path";
import { ACCOUNTS, BASE_URL, ROLES, homePattern } from "./helpers/accounts";
import { passwordInput } from "./helpers/ui";

/**
 * Global setup: login sekali untuk setiap role, simpan cookie ke
 * tests/.auth/{role}.json. Fixtures di tests/fixtures/roles.ts memakai
 * file ini sebagai storageState sehingga tiap role tidak perlu login
 * berulang di setiap test.
 */

const AUTH_DIR = path.join(__dirname, ".auth");

export default async function globalSetup() {
  const browser = await chromium.launch();
  try {
    for (const role of ROLES) {
      const account = ACCOUNTS[role];
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(`${BASE_URL}/auth/login`, {
        waitUntil: "networkidle",
      });
      await page.getByLabel("Email").fill(account.email);
      // label "Kata Sandi" tidak ter-associate (lihat passwordInput di helpers/ui.ts)
      await passwordInput(page, "password").fill(account.password);
      await page.getByRole("button", { name: "Login" }).click();

      // Tunggu redirect sesuai role (lihat src/actions/login.ts)
      await page.waitForURL(homePattern(account.home), {
        timeout: 30_000,
      });

      await context.storageState({
        path: path.join(AUTH_DIR, `${role}.json`),
      });
      await context.close();
      console.log(`[global-setup] login ${role} OK`);
    }
  } finally {
    await browser.close();
  }
}
