import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Konfigurasi Playwright untuk LMS USTI.
 *
 * Test menjalankan frontend (localhost:3000) dan backend (localhost:3001)
 * secara bersamaan. Jika server sudah berjalan, server yang ada dipakai
 * kembali (reuseExistingServer).
 */

const FE_URL = process.env.FE_URL ?? 'http://localhost:3000';
const BE_URL = process.env.BE_URL ?? 'http://localhost:3001/lms-usti-api';

export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: FE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Toast (sonner) butuh waktu; beri margin agar tidak flaky. */
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run local dev server before starting the tests */
  webServer: [
    {
      command: 'npm run dev',
      url: FE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'air',
      url: BE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      cwd: path.join(__dirname, '..', 'lms-usti-be'),
    },
  ],

  globalSetup: './tests/global-setup.ts',
});
