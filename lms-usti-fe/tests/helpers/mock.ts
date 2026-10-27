import type { Page } from "@playwright/test";

/**
 * Helper untuk mock response API via page.route().
 * Dipakai di test partisi error (5xx, 401, offline) agar deterministik
 * tanpa harus bikin error beneran di backend.
 *
 * Contoh:
 *   await mockApiResponse(page, /\/classroom\/dosen\//, 500);
 */

export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  status: number,
  body?: unknown,
) {
  await page.route(urlPattern, (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(
        body ?? {
          meta: { status, message: "Mock error" },
          data: null,
        },
      ),
    }),
  );
}

/** Intercept hanya request tertentu (misal hanya GET dashboard). */
export async function mockApiGET(
  page: Page,
  urlPattern: string | RegExp,
  status: number,
  body?: unknown,
) {
  await page.route(urlPattern, (route) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    return route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(
        body ?? {
          meta: { status, message: "Mock error" },
          data: null,
        },
      ),
    });
  });
}
