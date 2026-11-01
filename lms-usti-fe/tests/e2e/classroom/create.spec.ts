import { test, expect } from "../../fixtures/roles";
import { uniqueName, selectOption } from "../../helpers/ui";

/**
 * TC-CLASS-CREATE — Buat Kelas (dosen) (P1)
 *
 * Partisi ekivalen (newClassroomSchema + form CreateClassroom):
 *  1. Semua valid → kelas dibuat, toast "Kelas berhasil dibuat"
 *  2. Nama kelas kosong → "Nama Kelas wajib diisi"
 *  3. Nomor ruangan kosong → "Ruang wajib diisi"
 *  4. Tahun ajaran format salah (bukan YYYY/YYYY) → format error
 *  5. class_start >= class_end → "Jam selesai kelas harus lebih besar dari jam mulai kelas"
 *
 * Cover Kelas punya default "basic" sehingga tidak perlu dipilih manual.
 * Room/term bertipe number, jadi "non-numeric" tidak bisa diisi via UI
 * (browser memblokir) — partisi invalid-nya diwakili oleh "kosong".
 */

async function openCreateClassroomDialog(
  dosenPage: import("@playwright/test").Page,
) {
  await dosenPage.goto("/dosen/kelas");
  await dosenPage.getByRole("button", { name: "Tambah Kelas" }).click();
  await expect(
    dosenPage.getByRole("dialog").filter({ hasText: "Buat Kelas" }),
  ).toBeVisible();
}

const CLASS_DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];

async function fillValidClassroom(
  dosenPage: import("@playwright/test").Page,
  name: string,
) {
  await dosenPage.getByLabel("Nama Kelas").fill(name);
  // Ruang dibatasi max 16 oleh input (constraint native browser memblokir
  // submit bila lebih) — pilih ruang + hari + jam acak agar tidak bentrok
  // dengan kelas dari run sebelumnya (backend tolak jadwal overlap).
  await dosenPage
    .getByLabel("Nomor Ruangan")
    .fill(String(1 + Math.floor(Math.random() * 16)));
  await dosenPage.getByLabel("Semester").fill("3");
  const startHour = 7 + Math.floor(Math.random() * 9); // 07:00–15:00
  await dosenPage
    .getByLabel("Waktu Mulai")
    .fill(`${String(startHour).padStart(2, "0")}:00`);
  await dosenPage
    .getByLabel("Waktu Selesai")
    .fill(`${String(startHour + 2).padStart(2, "0")}:00`);
  await selectOption(
    dosenPage,
    "Hari Kelas",
    CLASS_DAY_NAMES[Math.floor(Math.random() * CLASS_DAY_NAMES.length)],
  );
  await selectOption(dosenPage, "Program Studi", "Teknik Informatika");
  await dosenPage.getByLabel("Tahun Ajaran").fill("2025/2026");
}

test.describe("Data Kelas", () => {
  // TC-CLASS-CREATE-01
  test("Menambah kelas dengan data yang lengkap dan valid", async ({
    dosenPage,
  }) => {
    const name = uniqueName("Kelas QA");
    await openCreateClassroomDialog(dosenPage);
    await fillValidClassroom(dosenPage, name);
    await dosenPage.getByRole("button", { name: "Simpan" }).click();

    await expect(dosenPage.getByText("Kelas berhasil dibuat")).toBeVisible({
      timeout: 15_000,
    });
    // dialog tertutup
    await expect(
      dosenPage.getByRole("dialog").filter({ hasText: "Buat Kelas" }),
    ).toBeHidden();
    // kelas muncul di list (router.refresh setelah server action bisa lambat)
    await expect(dosenPage.getByText(name).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  // TC-CLASS-CREATE-02
  test("Menambah kelas dengan nama kelas yang kosong", async ({ dosenPage }) => {
    await openCreateClassroomDialog(dosenPage);
    await dosenPage.getByLabel("Nomor Ruangan").fill("12");
    await dosenPage.getByLabel("Semester").fill("3");
    await dosenPage.getByLabel("Waktu Mulai").fill("08:00");
    await dosenPage.getByLabel("Waktu Selesai").fill("10:00");
    await selectOption(dosenPage, "Hari Kelas", "Senin");
    await selectOption(dosenPage, "Program Studi", "Teknik Informatika");
    await dosenPage.getByLabel("Tahun Ajaran").fill("2025/2026");
    await dosenPage.getByRole("button", { name: "Simpan" }).click();

    await expect(dosenPage.getByText("Nama Kelas wajib diisi")).toBeVisible();
  });

  // TC-CLASS-CREATE-03
  test("Menambah kelas dengan nomor ruangan yang kosong", async ({
    dosenPage,
  }) => {
    await openCreateClassroomDialog(dosenPage);
    await dosenPage.getByLabel("Nama Kelas").fill(uniqueName("Kelas"));
    await dosenPage.getByLabel("Semester").fill("3");
    await dosenPage.getByLabel("Waktu Mulai").fill("08:00");
    await dosenPage.getByLabel("Waktu Selesai").fill("10:00");
    await selectOption(dosenPage, "Hari Kelas", "Senin");
    await selectOption(dosenPage, "Program Studi", "Teknik Informatika");
    await dosenPage.getByLabel("Tahun Ajaran").fill("2025/2026");
    await dosenPage.getByRole("button", { name: "Simpan" }).click();

    await expect(dosenPage.getByText("Ruang wajib diisi").first()).toBeVisible();
  });

  // TC-CLASS-CREATE-04
  test("Menambah kelas dengan tahun ajaran yang tidak sesuai format", async ({
    dosenPage,
  }) => {
    await openCreateClassroomDialog(dosenPage);
    await fillValidClassroom(dosenPage, uniqueName("Kelas"));
    // override tahun ajaran dengan format invalid
    await dosenPage.getByLabel("Tahun Ajaran").fill("2025-2026");
    await dosenPage.getByRole("button", { name: "Simpan" }).click();

    await expect(
      dosenPage.getByText(
        "Format tahun ajaran tidak sesuai (contoh: 2025/2026)",
      ),
    ).toBeVisible();
  });

  // TC-CLASS-CREATE-05
  test("Menambah kelas dengan jam selesai sebelum jam mulai", async ({
    dosenPage,
  }) => {
    await openCreateClassroomDialog(dosenPage);
    await dosenPage.getByLabel("Nama Kelas").fill(uniqueName("Kelas"));
    await dosenPage.getByLabel("Nomor Ruangan").fill("12");
    await dosenPage.getByLabel("Semester").fill("3");
    await dosenPage.getByLabel("Waktu Mulai").fill("10:00");
    await dosenPage.getByLabel("Waktu Selesai").fill("08:00"); // < start
    await selectOption(dosenPage, "Hari Kelas", "Senin");
    await selectOption(dosenPage, "Program Studi", "Teknik Informatika");
    await dosenPage.getByLabel("Tahun Ajaran").fill("2025/2026");
    await dosenPage.getByRole("button", { name: "Simpan" }).click();

    await expect(
      dosenPage.getByText(
        "Jam selesai kelas harus lebih besar dari jam mulai kelas",
      ),
    ).toBeVisible();
  });
});
