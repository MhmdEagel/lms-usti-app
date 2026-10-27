import { test, expect } from "../../fixtures/roles";
import { mockApiResponse, mockApiGET } from "../../helpers/mock";
import { uniqueName } from "../../helpers/ui";

/**
 * TC-ERROR — Partisi respons server (mocked) (P3)
 *
 * Domain respons server dipartisi menjadi 3 kelas:
 *  1. 2xx → normal (sudah dicover test lain)
 *  2. 4xx (401) → sesi tidak valid → redirect ke login
 *  3. 5xx → app tidak crash, menampilkan fallback UI / toast error
 *
 * Mock via page.route agar deterministik tanpa bikin error beneran.
 */

test.describe("Penanganan Error Server", () => {
  // TC-ERROR-01
  test("Melihat halaman dashboard ketika server mengalami gangguan", async ({
    mahasiswaPage,
  }) => {
    await mockApiGET(
      mahasiswaPage,
      "**/classroom/mahasiswa/dashboard-stats",
      500,
    );
    await mockApiGET(mahasiswaPage, "**/classroom/mahasiswa/classrooms", 500);

    // networkidle tidak stabil di dev server Turbopack — pakai load saja.
    await mahasiswaPage.goto("/mahasiswa", { waitUntil: "load" });

    // shell dashboard tetap tampil (sidebar Beranda)
    await expect(
      mahasiswaPage.getByRole("link", { name: "Beranda" }).first(),
    ).toBeVisible();
  });

  // TC-ERROR-02
  test("Mengakses halaman dashboard dengan sesi yang sudah tidak berlaku", async ({
    mahasiswaPage,
  }) => {
    // Token palsu → panggilan server-side /auth/me di middleware gagal
    // (page.route hanya mem- intercept request browser, bukan request
    // server-side Next.js, jadi cara ini yang benar-benar mensimulasikan
    // sesi kedaluwarsa).
    await mahasiswaPage.context().addCookies([
      {
        name: "access_token",
        value: "token-tidak-valid.untuk.uji.sesi",
        url: "http://localhost:3000",
      },
    ]);

    await mahasiswaPage.goto("/mahasiswa");

    await expect(mahasiswaPage).toHaveURL(/\/auth\/login/, {
      timeout: 20_000,
    });
  });

  // TC-ERROR-03
  test("Menambah postingan forum ketika server mengalami gangguan", async ({
    dosenPage,
  }) => {
    await mockApiResponse(dosenPage, "**/forum/posts", 500);

    await dosenPage.goto("/dosen/forum");
    await dosenPage.getByRole("button", { name: "Buat Postingan" }).click();
    await dosenPage.getByLabel("Judul").fill(uniqueName("Forum Error"));
    await dosenPage.locator('[contenteditable="true"]').first().click();
    await dosenPage.keyboard.type("Konten uji partisi error.");
    await dosenPage.getByRole("button", { name: "Posting" }).click();

    await expect(dosenPage.getByText("Gagal membuat postingan")).toBeVisible({
      timeout: 15_000,
    });
  });
});
