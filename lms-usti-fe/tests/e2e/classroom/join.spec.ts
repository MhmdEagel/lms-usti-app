import { test, expect } from "../../fixtures/roles";
import { ACCOUNTS } from "../../helpers/accounts";
import {
  apiLogin,
  apiCreateClassroom,
  apiJoinClassroom,
} from "../../helpers/api";

/**
 * TC-CLASS-JOIN — Gabung Kelas (mahasiswa) (P1)
 *
 * Partisi ekivalen (joinClassroomSchema + endpoint /classroom/join):
 *  1. Kode valid (>= 4 char, kelas ada) → "Berhasil gabung kelas"
 *  2. Kode < 4 char → "Kode kelas wajib diisi" (client validation)
 *  3. Kode format valid tapi tidak ada → error, dialog tetap buka
 */

async function openJoinDialog(
  mahasiswaPage: import("@playwright/test").Page,
) {
  await mahasiswaPage.goto("/mahasiswa/kelas");
  // Ada dua tombol "Gabung Kelas" (toolbar + empty state) — pakai yang pertama.
  await mahasiswaPage
    .getByRole("button", { name: "Gabung Kelas" })
    .first()
    .click();
  await expect(
    mahasiswaPage.getByRole("dialog").filter({ hasText: "Gabung Kelas" }),
  ).toBeVisible();
}

test.describe("Data Kelas", () => {
  // TC-CLASS-JOIN-02
  test("Bergabung ke kelas dengan kode kelas yang terlalu pendek", async ({
    mahasiswaPage,
  }) => {
    await openJoinDialog(mahasiswaPage);
    await mahasiswaPage.getByLabel("Kode Kelas").fill("abc");
    await mahasiswaPage
      .getByRole("button", { name: "Gabung", exact: true })
      .click();

    await expect(
      mahasiswaPage.getByText("Kode kelas wajib diisi"),
    ).toBeVisible();
  });

  // TC-CLASS-JOIN-03
  test("Bergabung ke kelas dengan kode kelas yang tidak tersedia", async ({
    mahasiswaPage,
  }) => {
    await openJoinDialog(mahasiswaPage);
    await mahasiswaPage.getByLabel("Kode Kelas").fill("KLS-TIDAKADA");
    await mahasiswaPage
      .getByRole("button", { name: "Gabung", exact: true })
      .click();

    // tidak ada toast sukses
    await expect(
      mahasiswaPage.getByText("Berhasil gabung kelas"),
    ).toHaveCount(0);
    // dialog masih terbuka (error handling tidak menutup dialog)
    await expect(
      mahasiswaPage.getByRole("dialog").filter({ hasText: "Gabung Kelas" }),
    ).toBeVisible();
  });

  // TC-CLASS-JOIN-01
  test("Bergabung ke kelas dengan kode kelas yang valid", async ({
    mahasiswaPage,
    request,
  }) => {
    // Seed kelas baru via API sebagai dosen, lalu join via UI
    const dosenToken = await apiLogin(
      request,
      ACCOUNTS.dosen.email,
      ACCOUNTS.dosen.password,
    );
    const classroom = await apiCreateClassroom(request, dosenToken);

    await openJoinDialog(mahasiswaPage);
    await mahasiswaPage.getByLabel("Kode Kelas").fill(classroom.class_code);
    // Tombol submit di dalam dialog berlabel "Gabung" (bukan "Gabung Kelas").
    await mahasiswaPage
      .getByRole("button", { name: "Gabung", exact: true })
      .click();

    await expect(mahasiswaPage.getByText("Berhasil gabung kelas")).toBeVisible({
      timeout: 15_000,
    });
    // Kelas dicari lewat search (list dipaginasi & terurut UUID, jadi kelas
    // baru tidak dijamin muncul di halaman 1 tanpa filter).
    await mahasiswaPage.getByPlaceholder("Cari kelas...").fill(classroom.class_name);
    await expect(
      mahasiswaPage.getByText(classroom.class_name).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});

// Pastikan helper apiJoinClassroom terpakai minimal sekali agar tidak dianggap unused oleh linter
void apiJoinClassroom;
