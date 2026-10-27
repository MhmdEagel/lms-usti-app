import { test, expect } from "../../fixtures/roles";
import { ACCOUNTS } from "../../helpers/accounts";
import {
  apiLogin,
  apiCreateClassroom,
  apiJoinClassroom,
} from "../../helpers/api";

/**
 * TC-BROADCAST — Pesan Siaran (dosen) (P2)
 *
 * Tombol "Kirim Pesan Siaran" hanya muncul jika ada member (recipientCount > 0),
 * jadi tiap test seed kelas + 1 mahasiswa join via API.
 *
 * Partisi ekivalen (broadcastMessageSchema):
 *  1. Valid: judul & pesan dalam panjang yang benar → toast sukses
 *  2. Judul terlalu pendek → "Judul minimal 3 karakter"
 *  3. Judul terlalu panjang → "Judul maksimal 120 karakter"
 *  4. Pesan terlalu panjang → "Pesan maksimal 2000 karakter"
 */

async function seedClassroomWithMember(
  request: import("@playwright/test").APIRequestContext,
) {
  const dosenToken = await apiLogin(
    request,
    ACCOUNTS.dosen.email,
    ACCOUNTS.dosen.password,
  );
  const classroom = await apiCreateClassroom(request, dosenToken);
  const mahasiswaToken = await apiLogin(
    request,
    ACCOUNTS.mahasiswa.email,
    ACCOUNTS.mahasiswa.password,
  );
  await apiJoinClassroom(request, mahasiswaToken, classroom.class_code);
  return classroom;
}

async function openBroadcastDialog(
  dosenPage: import("@playwright/test").Page,
  classroomId: string,
) {
  await dosenPage.goto(`/dosen/kelas/${classroomId}/anggota`);
  await dosenPage.getByRole("button", { name: "Kirim Pesan Siaran" }).click();
  await expect(
    dosenPage
      .getByRole("dialog")
      .filter({ hasText: "Pesan Siaran ke Mahasiswa" }),
  ).toBeVisible();
}

test.describe("Pesan Siaran", () => {
  // TC-BROADCAST-01
  test("Mengirim pesan siaran dengan judul dan pesan yang valid", async ({
    dosenPage,
    request,
  }) => {
    const classroom = await seedClassroomWithMember(request);
    await openBroadcastDialog(dosenPage, classroom.id);

    await dosenPage.getByLabel("Judul").fill("Judul Siaran Uji");
    // getByLabel("Pesan") juga match dialog (namanya "Pesan Siaran ke
    // Mahasiswa") — pakai role textbox agar unik.
    await dosenPage
      .getByRole("textbox", { name: "Pesan" })
      .fill("Isi pesan siaran untuk uji QA.");
    await dosenPage.getByRole("button", { name: "Kirim Pesan Siaran" }).click();

    await expect(
      dosenPage.getByText(
        /Broadcast terkirim ke \d+ mahasiswa|Broadcast berhasil dikirim/,
      ),
    ).toBeVisible({ timeout: 15_000 });
    // dialog tertutup setelah sukses
    await expect(
      dosenPage
        .getByRole("dialog")
        .filter({ hasText: "Pesan Siaran ke Mahasiswa" }),
    ).toBeHidden();
  });

  // TC-BROADCAST-02
  test("Mengirim pesan siaran dengan judul yang terlalu pendek", async ({
    dosenPage,
    request,
  }) => {
    const classroom = await seedClassroomWithMember(request);
    await openBroadcastDialog(dosenPage, classroom.id);

    await dosenPage.getByLabel("Judul").fill("ab");
    await dosenPage
      .getByRole("textbox", { name: "Pesan" })
      .fill("Isi pesan yang valid.");
    await dosenPage.getByRole("button", { name: "Kirim Pesan Siaran" }).click();

    await expect(
      dosenPage.getByText("Judul minimal 3 karakter"),
    ).toBeVisible();
  });

  // TC-BROADCAST-03
  test("Mengirim pesan siaran dengan judul yang terlalu panjang", async ({
    dosenPage,
    request,
  }) => {
    const classroom = await seedClassroomWithMember(request);
    await openBroadcastDialog(dosenPage, classroom.id);

    await dosenPage.getByLabel("Judul").fill("x".repeat(121));
    await dosenPage
      .getByRole("textbox", { name: "Pesan" })
      .fill("Isi pesan yang valid.");
    await dosenPage.getByRole("button", { name: "Kirim Pesan Siaran" }).click();

    await expect(
      dosenPage.getByText("Judul maksimal 120 karakter"),
    ).toBeVisible();
  });

  // TC-BROADCAST-04
  test("Mengirim pesan siaran dengan isi pesan yang terlalu panjang", async ({
    dosenPage,
    request,
  }) => {
    const classroom = await seedClassroomWithMember(request);
    await openBroadcastDialog(dosenPage, classroom.id);

    await dosenPage.getByLabel("Judul").fill("Judul Siaran Uji");
    await dosenPage
      .getByRole("textbox", { name: "Pesan" })
      .fill("y".repeat(2001));
    await dosenPage.getByRole("button", { name: "Kirim Pesan Siaran" }).click();

    await expect(
      dosenPage.getByText("Pesan maksimal 2000 karakter"),
    ).toBeVisible();
  });
});
