import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Helper UI umum untuk test E2E (selector shadcn/radix).
 */

/** Nama unik per run agar data test tidak bentrok satu sama lain. */
export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

/**
 * Toast sukses dari sonner. Dipakai karena hampir semua aksi di app
 * memberi notifikasi lewat toast.success / toast.error.
 */
export function expectToast(page: Page, text: string | RegExp) {
  return expect(page.getByText(text).first()).toBeVisible();
}

/**
 * Pilih opsi pada Radix Select shadcn.
 * Radix tidak memakai <select>, jadi harus klik trigger lalu klik option.
 *
 * @param label label form ("Hari Kelas") ATAU placeholder trigger ("Pilih Hari")
 */
export async function selectOption(
  page: Page,
  label: string,
  option: string,
) {
  await page.getByLabel(label).or(page.getByRole("combobox", { name: label })).first().click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

/**
 * Isi satu field form shadcn (label -> input).
 */
export async function fillField(page: Page, label: string, value: string) {
  await page.getByLabel(label).fill(value);
}

/**
 * Locator input password.
 *
 * Diperlukan karena beberapa form password di app membungkus <Input> dengan
 * <div className="relative"> di dalam FormControl (Login, ChangePasswordForm,
 * CreateUserDialog). FormControl adalah Slot yang menaruh id pada anak
 * tunggalnya, jadi htmlFor label menunjuk ke div, bukan input —
 * getByLabel("Kata Sandi") tidak akan pernah match. Akses via name
 * attribute dari react-hook-form sampai asosiasi label-nya diperbaiki.
 */
export function passwordInput(
  page: Page,
  field: "password" | "old_password" | "new_password" | "confirmPassword",
) {
  return page.locator(`input[name="${field}"]`);
}

/**
 * Submit form dengan tombol submit tertentu.
 */
export async function clickButton(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).click();
}

/**
 * Tunggu elemen form validation muncul.
 */
export async function expectValidationError(page: Page, message: string) {
  await expect(page.getByText(message).first()).toBeVisible();
}

/**
 * Pastikan dialog (radix) terbuka.
 */
export async function expectDialogOpen(page: Page, title: string) {
  await expect(page.getByRole("dialog").filter({ hasText: title })).toBeVisible();
}

/**
 * Pastikan dialog tertutup.
 */
export async function expectDialogClosed(page: Page, title: string) {
  await expect(page.getByRole("dialog").filter({ hasText: title })).toBeHidden();
}
