import { test, expect } from "../../fixtures/roles";
import { uniqueName } from "../../helpers/ui";

/**
 * TC-FORUM — Forum publik (P2)
 *
 * Partisi ekivalen (createForumPostSchema):
 *  1. Valid: judul + konten terisi → "Postingan berhasil dibuat"
 *  2. Judul kosong → "Judul harus diisi"
 *
 * Catatan: content bersifat optional di schema (z.string().optional()),
 * jadi "konten kosong" BUKAN partisi invalid — tidak perlu diuji sebagai error.
 */

async function openCreatePostDialog(
  dosenPage: import("@playwright/test").Page,
) {
  await dosenPage.goto("/dosen/forum");
  await dosenPage.getByRole("button", { name: "Buat Postingan" }).click();
  await expect(
    dosenPage.getByRole("dialog").filter({ hasText: "Buat Postingan Baru" }),
  ).toBeVisible();
}

test.describe("Forum Publik", () => {
  // TC-FORUM-01
  test("Menambah postingan forum dengan judul dan konten yang valid", async ({
    dosenPage,
  }) => {
    const title = uniqueName("Forum QA");

    await openCreatePostDialog(dosenPage);
    await dosenPage.getByLabel("Judul").fill(title);
    await dosenPage.locator('[contenteditable="true"]').first().click();
    await dosenPage.keyboard.type("Ini adalah konten postingan uji QA.");
    await dosenPage.getByRole("button", { name: "Posting" }).click();

    await expect(dosenPage.getByText("Postingan berhasil dibuat")).toBeVisible({
      timeout: 15_000,
    });
    await expect(dosenPage.getByText(title).first()).toBeVisible();
  });

  // TC-FORUM-02
  test("Menambah postingan forum dengan judul yang kosong", async ({
    dosenPage,
  }) => {
    await openCreatePostDialog(dosenPage);
    await dosenPage.locator('[contenteditable="true"]').first().click();
    await dosenPage.keyboard.type("Konten tanpa judul.");
    await dosenPage.getByRole("button", { name: "Posting" }).click();

    await expect(dosenPage.getByText("Judul harus diisi")).toBeVisible();
  });
});
