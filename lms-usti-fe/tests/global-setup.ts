import { chromium } from "@playwright/test";
import path from "path";
import {
  ACCOUNTS,
  API_URL,
  BASE_URL,
  ROLES,
  homePattern,
} from "./helpers/accounts";
import { passwordInput } from "./helpers/ui";

/**
 * Global setup: pastikan FE & BE sudah berjalan, lalu login sekali untuk
 * setiap role dan simpan cookie ke tests/.auth/{role}.json. Fixtures di
 * tests/fixtures/roles.ts memakai file ini sebagai storageState sehingga
 * tiap role tidak perlu login berulang di setiap test.
 *
 * Playwright TIDAK menyalakan server (tidak ada `webServer` di config),
 * jadi kedua server harus sudah jalan sebelum suite dijalankan.
 */

const AUTH_DIR = path.join(__dirname, ".auth");

const TIMEOUT = 30_000;

/** Cek server bisa dihubungi (status apa pun dianggap hidup). */
async function assertReachable(label: string, url: string, hint: string) {
  try {
    await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[global-setup] ${label} tidak dapat diakses di ${url} (${reason}).\n` +
        `Jalankan dulu: ${hint}\n` +
        `Atau arahkan FE_URL / API_URL ke server yang sudah berjalan.`,
    );
  }
}

async function assertServersRunning() {
  await assertReachable("Frontend", BASE_URL, "cd lms-usti-fe && npm run dev");
  await assertReachable(
    "Backend",
    `${API_URL}/auth/me`,
    "cd lms-usti-be && air",
  );
}

export default async function globalSetup() {
  await assertServersRunning();

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
