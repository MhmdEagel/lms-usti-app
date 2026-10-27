# Test Case Dokumentasi — LMS USTI E2E (Playwright)

> Suite: `lms-usti-fe/tests/e2e` — 46 TC ID unik → **52 test instance** (beberapa TC diuji per role).
> Metode desain test: **Equivalence Partitioning (EP)**, bukan Boundary Value Analysis.
> Jalankan: `npx.cmd playwright test --project=chromium`

## 1. Modul → Fitur

| Modul | Fitur |
|---|---|
| Auth | Login |
| Auth | RBAC / Middleware |
| Auth | Ubah Password |
| Classroom | Buat Kelas (dosen) |
| Classroom | Gabung Kelas (mahasiswa) |
| Materi | Tambah Materi (dosen) |
| Assignment | Lifecycle Tugas (dosen + mahasiswa) |
| Assignment | Pengumpulan Tugas (mahasiswa) |
| Assignment | Penilaian Tugas (dosen) |
| Broadcast | Pesan Siaran (dosen) |
| Forum | Forum Publik |
| Profile | Profil Pengguna |
| Errors | Penanganan Error Server |

## 2. Test Case

| Fitur | Test Case ID | Test Case |
|---|---|---|
| Login | TC-AUTH-01 | Melakukan login sebagai mahasiswa/dosen/prodi dengan kredensial yang valid *(3 test, 1 per role)* |
| Login | TC-AUTH-02 | Melakukan login dengan format email yang tidak valid |
| Login | TC-AUTH-03 | Melakukan login dengan email yang kosong |
| Login | TC-AUTH-04 | Melakukan login dengan kata sandi yang kosong |
| Login | TC-AUTH-05 | Melakukan login dengan kata sandi yang salah |
| RBAC / Middleware | TC-RBAC-01 | Mengakses halaman dashboard ketika belum login → redirect ke `/auth/login` + callbackUrl |
| RBAC / Middleware | TC-RBAC-02 | Mengakses halaman login ketika belum login → halaman bisa diakses |
| RBAC / Middleware | TC-RBAC-03 | Mengakses halaman sendiri dengan akun sendiri *(3 test, 1 per role)* |
| RBAC / Middleware | TC-RBAC-04 | Mengakses halaman role lain → redirect ke home sendiri *(3 test, 1 per role)* |
| Ubah Password | TC-PWD-02 | Mengubah password dengan password baru yang terlalu pendek (< 8 char) |
| Ubah Password | TC-PWD-03 | Mengubah password dengan password baru tanpa huruf besar dan angka |
| Ubah Password | TC-PWD-04 | Mengubah password dengan konfirmasi password yang tidak sama |
| Ubah Password | TC-PWD-05 | Mengubah password dengan password lama yang kosong |
| Buat Kelas (dosen) | TC-CLASS-CREATE-01 | Menambah kelas dengan data yang lengkap dan valid |
| Buat Kelas (dosen) | TC-CLASS-CREATE-02 | Menambah kelas dengan nama kelas yang kosong |
| Buat Kelas (dosen) | TC-CLASS-CREATE-03 | Menambah kelas dengan nomor ruangan yang kosong |
| Buat Kelas (dosen) | TC-CLASS-CREATE-04 | Menambah kelas dengan tahun ajaran yang tidak sesuai format |
| Buat Kelas (dosen) | TC-CLASS-CREATE-05 | Menambah kelas dengan jam selesai sebelum jam mulai |
| Gabung Kelas (mahasiswa) | TC-CLASS-JOIN-01 | Bergabung ke kelas dengan kode kelas yang terlalu pendek (< 4 char) |
| Gabung Kelas (mahasiswa) | TC-CLASS-JOIN-02 | Bergabung ke kelas dengan kode kelas yang tidak tersedia |
| Gabung Kelas (mahasiswa) | TC-CLASS-JOIN-03 | Bergabung ke kelas dengan kode kelas yang valid → kelas muncul di list (via search) |
| Tambah Materi (dosen) | TC-MATERIAL-01 | Menambah materi dengan data yang valid (termasuk lampiran file PDF valid) |
| Tambah Materi (dosen) | TC-MATERIAL-02 | Menambah materi dengan lampiran file yang tipe-nya tidak diizinkan (`.exe`) |
| Tambah Materi (dosen) | TC-MATERIAL-03 | Menambah materi dengan lampiran file yang terlalu besar (≥ 1 MB, guard client) |
| Tambah Materi (dosen) | TC-MATERIAL-04 | Menambah materi dengan link lampiran yang tidak valid |
| Lifecycle Tugas | TC-LIFECYCLE-01 | Melakukan pengumpulan tugas dari mahasiswa dan penilaian dari dosen (full flow: buat tugas → submit link → nilai) |
| Pengumpulan Tugas (mahasiswa) | TC-SUBMIT-01 | Mengumpulkan tugas dengan lampiran file yang valid → trigger berubah jadi "Edit Pengumpulan" |
| Pengumpulan Tugas (mahasiswa) | TC-SUBMIT-02 | Membuka dialog kumpulkan tanpa lampiran → tombol "Kumpulkan" disabled |
| Pengumpulan Tugas (mahasiswa) | TC-SUBMIT-03 | Mengumpulkan tugas dengan lampiran file yang tipe-nya tidak diizinkan (`.exe`) |
| Pengumpulan Tugas (mahasiswa) | TC-SUBMIT-04 | Mengumpulkan tugas dengan lampiran file yang terlalu besar (> 10 MB, guard backend) |
| Pengumpulan Tugas (mahasiswa) | TC-SUBMIT-05 | Mengumpulkan tugas setelah deadline dengan late submission tidak diizinkan → alert blokir + disabled |
| Penilaian Tugas (dosen) | TC-GRADE-01 | Menilai pengumpulan mahasiswa dengan nilai dan umpan balik yang valid → toast sukses, badge "Sudah dinilai", nilai tampil di list |
| Penilaian Tugas (dosen) | TC-GRADE-02 | Menilai pengumpulan mahasiswa dengan nilai lebih dari 100 → toast "Nilai tidak boleh lebih dari 100", status tidak berubah |
| Penilaian Tugas (dosen) | TC-GRADE-03 | Memilih mahasiswa yang belum mengirim tugas → warning "Mahasiswa belum mengirim tugas", input nilai & tombol Simpan tidak dirender |
| Penilaian Tugas (dosen) | TC-GRADE-04 | Mengubah nilai yang sudah tersimpan (regrade) → input ter-prefill nilai lama, simpan nilai baru → ter-update |
| Pesan Siaran (dosen) | TC-BROADCAST-01 | Mengirim pesan siaran dengan judul dan pesan yang valid |
| Pesan Siaran (dosen) | TC-BROADCAST-02 | Mengirim pesan siaran dengan judul yang terlalu pendek |
| Pesan Siaran (dosen) | TC-BROADCAST-03 | Mengirim pesan siaran dengan judul yang terlalu panjang |
| Pesan Siaran (dosen) | TC-BROADCAST-04 | Mengirim pesan siaran dengan isi pesan yang terlalu panjang |
| Forum Publik | TC-FORUM-01 | Menambah postingan forum dengan judul dan konten yang valid |
| Forum Publik | TC-FORUM-02 | Menambah postingan forum dengan judul yang kosong |
| Profil Pengguna | TC-PROFILE-01 | Mengubah profil dengan data yang valid |
| Profil Pengguna | TC-PROFILE-02 | Mengubah profil dengan format email yang tidak valid |
| Penanganan Error Server | TC-ERROR-01 | Melihat halaman dashboard ketika server mengalami gangguan (network down) |
| Penanganan Error Server | TC-ERROR-02 | Mengakses halaman dashboard dengan sesi yang sudah tidak berlaku (token kedaluwarsa) |
| Penanganan Error Server | TC-ERROR-03 | Menambah postingan forum ketika server mengalami gangguan |

## 3. Catatan

- **TC-PWD-01** (ubah password valid) sengaja tidak dibuat otomatis — submit valid memicu pengiriman OTP email sungguhan; terdokumentasi sebagai manual test di header `tests/e2e/auth/password.spec.ts`.
- TC-CLASS-CREATE / TC-CLASS-JOIN mengikuti prefix modul di header tiap spec; penomoran per test mengikuti urutan di file.
- Spec terkait:

| Test Case ID prefix | File spec |
|---|---|
| TC-AUTH | `tests/e2e/auth/login.spec.ts` |
| TC-RBAC | `tests/e2e/auth/rbac.spec.ts` |
| TC-PWD | `tests/e2e/auth/password.spec.ts` |
| TC-CLASS-CREATE | `tests/e2e/classroom/create.spec.ts` |
| TC-CLASS-JOIN | `tests/e2e/classroom/join.spec.ts` |
| TC-MATERIAL | `tests/e2e/material/material.spec.ts` |
| TC-LIFECYCLE | `tests/e2e/assignment/lifecycle.spec.ts` |
| TC-SUBMIT | `tests/e2e/assignment/submission.spec.ts` |
| TC-GRADE | `tests/e2e/assignment/grading.spec.ts` |
| TC-BROADCAST | `tests/e2e/broadcast/broadcast.spec.ts` |
| TC-FORUM | `tests/e2e/forum/forum.spec.ts` |
| TC-PROFILE | `tests/e2e/profile/profile.spec.ts` |
| TC-ERROR | `tests/e2e/errors/network.spec.ts` |
