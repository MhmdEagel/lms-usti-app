import { defineConfig, devices } from '@playwright/test';

/**
 * Konfigurasi Playwright untuk LMS USTI.
 *
 * Test TIDAK menjalankan server apa pun. Frontend (localhost:3000) dan
 * backend (localhost:8080, lihat lms-usti-be/.env) harus sudah berjalan
 * sebelum `npm run test:e2e`:
 *
 *   # terminal 1
 *   cd lms-usti-fe && npm run dev
 *   # terminal 2
 *   cd lms-usti-be && air
 *
 * Global setup akan gagal lebih awal dengan pesan jelas jika salah satu
 * server belum bisa diakses.
 *
 * Override lewat env bila port berbeda:
 *   FE_URL=http://localhost:3000 API_URL=http://localhost:8080/lms-usti-api
 */

const FE_URL = process.env.FE_URL ?? 'http://localhost:3000';

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

  globalSetup: './tests/global-setup.ts',
});
