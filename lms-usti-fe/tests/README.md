# E2E Test Suite — LMS USTI (Playwright + Equivalence Partitioning)

## Cara Menjalankan

```bash
# pastikan backend jalan (air) di :3001 — atau biarkan Playwright yang start
npm run test:e2e            # semua test (chromium, firefox, webkit)
npm run test:e2e:smoke      # hanya P0 (@smoke)
npm run test:e2e:ui         # mode UI interaktif
npm run test:e2e:report     # lihat report terakhir

# satu browser saja (lebih cepat):
npx.cmd playwright test --project=chromium
```

`playwright.config.ts` akan otomatis menjalankan `npm run dev` (FE) dan
`air` (BE) jika server belum jalan (`webServer` + `reuseExistingServer`).

## Arsitektur Test

```
tests/
├── global-setup.ts          # login 4 role sekali → tests/.auth/*.json
├── fixtures/roles.ts        # fixtures: mahasiswaPage, dosenPage, adminPage, prodiPage
├── helpers/
│   ├── accounts.ts          # kredensial akun test (bisa di-override env)
│   ├── api.ts               # seeding lewat API backend (create kelas, join, dll)
│   ├── ui.ts                # helper UI (radix select, uniqueName, toast)
│   └── mock.ts              # mock respons API (partisi error 5xx/401)
└── e2e/                     # spesifikasi per fitur
```

**Prinsip:**
- **Seed via API, uji via UI** — data awal (kelas, join) dibuat lewat API agar
  test fokus pada alur yang sedang diuji.
- **Login sekali** — `global-setup` menyimpan cookie per role; tiap test pakai
  `storageState`, tidak login ulang.
- **Satu partisi = satu test** — lihat matriks di bawah.

## Konvensi Penamaan Test

Struktur di Playwright report (dan reporter HTML):

```
<deskripsi fitur>          ← test.describe, mis. "Data Kelas"
  └ <kalimat perilaku>     ← test(), kalimat utuh bahasa Indonesia
```

Aturan penamaan `test()`:
- **Pola utama**: *`[Kata kerja] + objek + "dengan" + field + kondisi partisi`*
  - "Menambah kelas dengan seluruh field yang valid" (partisi valid)
  - "Menambah kelas dengan nama kelas yang kosong" (partisi invalid: required kosong)
  - "Mengirim pesan siaran dengan judul yang terlalu pendek" (partisi invalid: min)
  - "Mengirim pesan siaran dengan judul yang terlalu panjang" (partisi invalid: max)
- Untuk test non-form (navigasi, error server, alur), kondisi ditulis dengan
  "ketika…": "Mengakses halaman dashboard ketika belum login",
  "Menambah postingan forum ketika server mengalami gangguan".
- **Partisi** ditulis sebagai **kelas input** ("yang kosong", "yang tidak valid",
  "yang tidak sesuai format", "yang terlalu pendek/panjang", "yang tidak
  tersedia") — **bukan** angka boundary (`< 3 char`, `> 120 char`) dan **bukan** kode TC.
  (Equivalence Partitioning, bukan Boundary Value Analysis.)
- **Kode TC (TC-AUTH-01, dst.)** tetap ada sebagai komentar `// TC-XXX` di
  atas test + di tabel matriks di bawah, untuk traceability.

Tag `@smoke` (untuk `npm run test:e2e:smoke`) dipasang lewat opsi
`{ tag: "@smoke" }`, bukan di dalam nama test.

## Matriks Test Case (Equivalence Partitioning)

| Kode | Partisi Input | Representative | Ekspektasi | Prioritas |
|---|---|---|---|---|
| TC-AUTH-01 | email valid + credential benar (×4 role) | akun demo tiap role | redirect ke home role | P0 |
| TC-AUTH-02 | email format invalid | `bukan-email` | "Email tidak sesuai" | P0 |
| TC-AUTH-03 | email kosong | `` | "Email wajib diisi" | P0 |
| TC-AUTH-04 | password kosong | `` | "Password tidak boleh kosong" | P0 |
| TC-AUTH-05 | credential salah | password salah | "email atau password salah" | P0 |
| TC-RBAC-01 | no cookie + route protected | `/mahasiswa` | redirect login + callbackUrl | P0 |
| TC-RBAC-02 | no cookie + route auth | `/auth/login` | halaman tampil | P0 |
| TC-RBAC-03 | role cocok prefix (×4) | tiap role → home sendiri | akses diterima | P0 |
| TC-RBAC-04 | role salah prefix (×4) | 1 prefix salah per role | redirect ke home | P0 |
| TC-CLASS-CREATE-01 | semua field valid | form lengkap | toast "Kelas berhasil dibuat" | P1 |
| TC-CLASS-CREATE-02 | nama kelas kosong | `` | "Nama Kelas wajib diisi" | P1 |
| TC-CLASS-CREATE-03 | nomor ruangan kosong¹ | `` | "Ruang wajib diisi" | P1 |
| TC-CLASS-CREATE-04 | tahun ajaran format salah | `2025-2026` | "Format tahun ajaran tidak sesuai" | P1 |
| TC-CLASS-CREATE-05 | jam selesai ≤ jam mulai | 10:00 → 08:00 | refine error waktu | P1 |
| TC-CLASS-JOIN-01 | kode valid + kelas ada | kode hasil seed API | "Berhasil gabung kelas" | P1 |
| TC-CLASS-JOIN-02 | kode < 4 char | `abc` | "Kode kelas wajib diisi" | P1 |
| TC-CLASS-JOIN-03 | kode valid tapi tidak ada | `KLS-TIDAKADA` | gagal, dialog tetap buka | P1 |
| TC-LIFECYCLE-01 | alur penuh | buat→kumpulkan→nilai | semua toast sukses | P1 |
| TC-MATERIAL-01 | materi valid² | judul saja | "Berhasil menambahkan materi" | P1 |
| TC-BROADCAST-01 | judul & pesan dalam panjang benar | panjang normal | "Broadcast terkirim ke N mahasiswa" | P2 |
| TC-BROADCAST-02 | judul terlalu pendek | `ab` | "Judul minimal 3 karakter" | P2 |
| TC-BROADCAST-03 | judul terlalu panjang | 121 char | "Judul maksimal 120 karakter" | P2 |
| TC-BROADCAST-04 | pesan terlalu panjang | 2001 char | "Pesan maksimal 2000 karakter" | P2 |
| TC-FORUM-01 | postingan valid | judul + konten | "Postingan berhasil dibuat" | P2 |
| TC-FORUM-02 | judul kosong | `` | "Judul harus diisi" | P2 |
| TC-ADMIN-USER-01 | user valid (role MAHASISWA) | form lengkap | dialog tertutup | P2 |
| TC-ADMIN-USER-02 | email invalid | `bukan-email` | "Format email tidak valid" | P2 |
| TC-ADMIN-USER-03 | nama kosong | `` | "Nama wajib diisi" | P2 |
| TC-ADMIN-USER-04 | dropdown role (enum) | 4 opsi | semua opsi tampil | P2 |
| TC-PWD-02 | new terlalu pendek | `Ab1` | "Password minimal 8 karakter" | P2 |
| TC-PWD-03 | new tanpa besar/angka | `abcdefghij` | pesan regex | P2 |
| TC-PWD-04 | confirm ≠ new | beda nilai | "Konfirmasi password tidak cocok" | P2 |
| TC-PWD-05 | old kosong | `` | "Password lama wajib diisi" | P2 |
| TC-PROFILE-01 | profil valid | fullname + email valid | "Profil berhasil diperbarui" | P2 |
| TC-PROFILE-02 | email invalid | `bukan-email` | "Format email tidak valid" | P2 |
| TC-ERROR-01 | server 5xx | mock 500 di stats | app tidak crash | P3 |
| TC-ERROR-02 | server 401 | mock 401 semua API | redirect login | P3 |
| TC-ERROR-03 | server 5xx saat POST | mock 500 di forum posts | toast "Gagal membuat postingan" | P3 |

¹ Input `type="number"` memblokir non-digit di browser, jadi partisi
"non-numeric" diwakili oleh "kosong".
² Field lain di `newMaterialSchema` semuanya optional, jadi hanya ada
1 partisi invalid yang bermakna.

## Kenapa EP Bisa Mengurangi Jumlah Test

Contoh form Buat Kelas (9 field):
- Tanpa EP: kombinasi 2^9+ kasus = ratusan test
- Dengan EP: 1 happy path + 1 test per field-partisi invalid ≈ 5 test

Aturan yang dipakai:
1. Semua field valid → **1** test (semua nilai valid satu kelas ekivalen).
2. Field required kosong → **1** test dengan 1 field representative
   (jalur validasi identik untuk semua required field di schema yang sama).
3. Field format (regex) → 1 representative invalid.
4. Field panjang → 1 test per **partisi panjang** (valid / terlalu pendek /
   terlalu panjang) — bukan 3 titik boundary; gabung jika pesan errornya sama.
5. Enum → 1 representative jika behavior berbeda; opsi dicek 1x.
6. Cross-field refine (start < end) → 1 test khusus.

## Data & Kebersihan Test

- Test membuat data unik (`timestamp`) — aman dijalankan berulang.
- Data test menumpuk di DB dev; bersihkan manual dari halaman admin /
  gunakan DB khusus testing.
- Akun demo ada di halaman login; admin dari `.env` backend
  (`ADMIN_EMAIL`/`ADMIN_PASSWORD`). Override lewat env:
  `TEST_DOSEN_EMAIL`, `TEST_DOSEN_PASSWORD`, dst (lihat `helpers/accounts.ts`).

## Catatan Desain

- **Label password tidak ter-associate** — `FormControl` (Radix `Slot`)
  menaruh `id` pada anak tunggalnya. Di Login, ChangePasswordForm, dan
  CreateUserDialog, anak itu `<div className="relative">` (wrapper tombol
  mata), jadi `htmlFor` label menunjuk ke div — `getByLabel("Kata Sandi")`
  tidak akan pernah match. Test pakai helper `passwordInput(page, field)`
  (`input[name=...]` dari react-hook-form). Jika asosiasi label-nya kelak
  diperbaiki di app, helper ini tetap berfungsi.
- **Radix Select** tidak bisa pakai `selectOption()` Playwright — pakai
  `selectOption()` di `helpers/ui.ts` (klik trigger → klik option).
- **Lexical editor** (forum/instruksi) — ketik via `contenteditable` +
  `keyboard.type()`, bukan `fill()`.
- **AddLinkDialog** punya 2 input dengan `id` duplikat (`link-string`) —
  pakai locator berbasis indeks, bukan `getByLabel`.
- **Toast** memakai sonner — assert via `getByText` pada teks toast.
- Login valid di `TC-PWD-01` sengaja tidak ditulis: submit valid memicu
  pengiriman OTP email sungguhan — biarkan sebagai manual/eksplorasi.
