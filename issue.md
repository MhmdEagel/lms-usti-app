# Issue: Unit Test untuk Fitur Autentikasi

## Goal

Membuat unit test yang komprehensif untuk seluruh fitur autentikasi backend (login, register, aktivasi email, resend aktivasi, reset password, new password) menggunakan `net/http/httptest` mengikuti pattern Gin testing. File utama bernama `main_auth_test.go`.

---

## Pertimbangan Arsitektur Test

**Masalah:** Fungsi `InitRouter()` di `router/api.go` memanggil `config.ConnectDatabase()` yang terkoneksi ke MySQL langsung. Jika tidak ada database, fungsi ini akan panic.

**Solusi yang harus dilakukan:**

Buat fungsi helper `setupAuthTestRouter` di file test. Fungsi ini tidak memanggil `config.ConnectDatabase()`, melainkan menerima `*gorm.DB` sebagai parameter (atau membuat in-memory test database sendiri).

Dengan pola ini, test bisa menggunakan:
- **SQLite in-memory** untuk test ringan dan cepat
- **Test MySQL database** untuk test yang lebih realistis

Pilih salah satu. Untuk kemudahan dan portabilitas, rekomendasi: SQLite in-memory via `gorm.io/driver/sqlite`.

> **Catatan:** Pastikan `go.mod` tidak berantakan. Jika pakai SQLite, tambahkan dependency `gorm.io/driver/sqlite` dengan `go get`.

---

## Tahapan

### Tahap 1 — Setup Infrastructure Test

Buat file: `lms-usti-be/main_auth_test.go`

Di dalam file ini, buat:

1. **Package declaration:** `package main` (atau `package test` — pilih salah satu dan konsisten)

2. **Fungsi `setupTestDB()`:**
   - Membuat koneksi ke database in-memory (SQLite atau test MySQL)
   - Menjalankan auto-migrate untuk model yang diperlukan: `User` dan `VerificationToken`
   - Mengembalikan `*gorm.DB`
   - Jika gagal, panggil `t.Fatal()`

3. **Fungsi `setupAuthTestRouter(db *gorm.DB) *gin.Engine`:**
   - Mirip seperti `InitRouter()` di `router/api.go` tapi tidak memanggil `config.ConnectDatabase()`
   - Menerima `*gorm.DB` sebagai parameter
   - Membuat repositories dari DB yang diberikan
   - Membuat authService dan authController dari repositories
   - Mendaftarkan route auth yang diperlukan:
     - `POST /lms-usti-api/auth/login`
     - `POST /lms-usti-api/auth/register`
     - `POST /lms-usti-api/auth/activation`
     - `POST /lms-usti-api/auth/activation/resend`
     - `POST /lms-usti-api/auth/reset-password`
     - `POST /lms-usti-api/auth/new-password`
     - `GET /lms-usti-api/auth/me` (tanpa auth middleware — atau dengan mock)
   - Mengembalikan `*gin.Engine`

> **Catatan penting:** Untuk `GET /me`, test perlu bypass auth middleware. Strateginya bisa dengan membuat middleware test khusus yang inject user ke context, atau mengirim Authorization header dengan token yang valid. Pilih yang paling sederhana.

---

### Tahap 2 — Test Helper: Seed Data & Cleanup

Buat fungsi helper untuk menyiapkan dan membersihkan data test:

1. **`cleanupDatabase(db *gorm.DB) error`**
   - Fungsi ini **wajib dipanggil di awal setiap function test**
   - Menghapus semua data dari tabel yang akan dipakai: `users` dan `verification_tokens`
   - Gunakan `db.Exec("DELETE FROM verification_tokens")` dan `db.Exec("DELETE FROM users")`
   - Urutan penting: hapus `verification_tokens` dulu baru `users` (karena foreign key)
   - Jika menggunakan SQLite, foreign key mungkin perlu diaktifkan manual via `PRAGMA foreign_keys = OFF`

2. **`seedUser(db *gorm.DB, ...) model.User`**
   - Menerima parameter yang dibutuhkan (email, password, role, fullname, emailVerified)
   - Hash password memakai `lib.HashPassword`
   - Simpan ke DB, return user yang sudah tersimpan (lengkap dengan ID)

3. **`seedVerificationToken(db *gorm.DB, email string, expired bool) model.VerificationToken`**
   - Membuat verification token untuk email tertentu
   - Jika `expired == true`, set expires ke waktu lalu (1 jam yang lalu)
   - Jika `expired == false`, set expires ke waktu depan (10 menit lagi)
   - Simpan ke DB, return token yang sudah tersimpan

4. **`makeRequest(router *gin.Engine, method, path, body string, token string) *httptest.ResponseRecorder`**
   - Membuat HTTP request dengan method, path, body JSON, dan optional Bearer token
   - Mengembalikan response recorder

---

### Tahap 3 — Test Register

Buat function `TestRegister` dengan sub-test. Setiap function test diawali dengan:

```go
func TestRegister(t *testing.T) {
    db := setupTestDB()
    router := setupAuthTestRouter(db)

    // Hapus semua data dari database sebelum test
    cleanupDatabase(db)

    t.Run("...", func(t *testing.T) {
        // ...
    })
}
```

1. **Register berhasil (DOSEN)**
   - Kirim `POST /lms-usti-api/auth/register` dengan body berisi fullname, email, password (min 8 karakter), role "DOSEN"
   - Assert: HTTP 200, `meta.message` = "register success"

2. **Register berhasil (MAHASISWA)**
   - Sama seperti di atas, role "MAHASISWA"
   - Assert: HTTP 200

3. **Register dengan email duplikat**
   - Seed user dengan email tertentu
   - Kirim register request dengan email yang sama
   - Assert: HTTP 409, `meta.message` mengandung "email sudah terdaftar"

4. **Register dengan body tidak valid**
   - Kirim body kosong
   - Assert: HTTP 400 dengan validation message
   - Kirim email tanpa `@`
   - Assert: HTTP 400
   - Kirim password kurang dari 8 karakter
   - Assert: HTTP 400
   - Kirim role bukan DOSEN/MAHASISWA
   - Assert: HTTP 400

---

### Tahap 4 — Test Login

Buat function `TestLogin` dengan sub-test. Awal function test, panggil `cleanupDatabase(db)`.

1. **Login berhasil**
   - Seed user dengan email, password, role, dan `EmailVerified` valid
   - Kirim `POST /lms-usti-api/auth/login` dengan email dan password yang benar
   - Assert: HTTP 200, `meta.message` = "login success", `data.access_token` tidak kosong, `data.token_type` = "Bearer"

2. **Login dengan email yang tidak terdaftar**
   - Kirim login dengan email yang belum pernah di-register
   - Assert: HTTP 401, `meta.message` = "email atau password salah"

3. **Login dengan password salah**
   - Seed user
   - Kirim login dengan password yang berbeda
   - Assert: HTTP 401, `meta.message` = "email atau password salah"

4. **Login dengan email belum diverifikasi**
   - Seed user dengan `EmailVerified` tidak valid (null)
   - Kirim login
   - Assert: HTTP 403, `meta.message` = "akun belum diverifikasi"

5. **Login dengan body tidak valid**
   - Kirim body kosong
   - Assert: HTTP 400

---

### Tahap 5 — Test Activation

Buat function `TestActivateUser` dengan sub-test. Awal function test, panggil `cleanupDatabase(db)`.

1. **Aktivasi berhasil**
   - Seed user dengan `EmailVerified` null
   - Seed verification token untuk email user tersebut (tidak expired)
   - Kirim `POST /lms-usti-api/auth/activation` dengan token yang valid
   - Assert: HTTP 200, `meta.message` = "account successfully activated"
   - Ambil user dari DB, cek `EmailVerified.Valid` = true

2. **Aktivasi dengan token tidak valid**
   - Kirim token random yang tidak ada di DB
   - Assert: HTTP 400, `meta.message` = "token tidak valid"

3. **Aktivasi dengan token expired**
   - Seed verification token dengan expired = true
   - Kirim request dengan token tersebut
   - Assert: HTTP 400, `meta.message` = "token sudah kedaluwarsa"

4. **Aktivasi dengan body kosong**
   - Assert: HTTP 400

---

### Tahap 6 — Test Resend Activation

Buat function `TestResendActivation` dengan sub-test. Awal function test, panggil `cleanupDatabase(db)`.

1. **Resend untuk email terdaftar**
   - Seed user dengan email tertentu
   - Kirim `POST /lms-usti-api/auth/activation/resend` dengan email yang benar
   - Assert: HTTP 200, `meta.message` = "email successfully sent"

2. **Resend untuk email tidak terdaftar**
   - Kirim email yang tidak ada di DB
   - Assert: HTTP 404, `meta.message` = "email tidak ditemukan"

3. **Resend dengan body tidak valid**
   - Kirim body kosong atau email tanpa `@`
   - Assert: HTTP 400

---

### Tahap 7 — Test Send Reset Password Email

Buat function `TestSendResetPasswordEmail` dengan sub-test. Awal function test, panggil `cleanupDatabase(db)`.

1. **Reset password untuk email terdaftar**
   - Seed user
   - Kirim `POST /lms-usti-api/auth/reset-password` dengan email yang benar
   - Assert: HTTP 200, `meta.message` = "email successfully sent"

2. **Reset password untuk email tidak terdaftar**
   - Assert: HTTP 404, `meta.message` = "email tidak ditemukan"

3. **Reset password dengan body tidak valid**
   - Assert: HTTP 400

---

### Tahap 8 — Test New Password (Reset Password Execute)

Buat function `TestNewPassword` dengan sub-test. Awal function test, panggil `cleanupDatabase(db)`.

1. **Reset password berhasil**
   - Seed user dengan password lama yang diketahui
   - Seed verification token untuk email user (tidak expired)
   - Kirim `POST /lms-usti-api/auth/new-password` dengan token, old_password, new_password
   - Assert: HTTP 200, `meta.message` = "password successfully changed"
   - Coba login dengan password baru — assert berhasil
   - Coba login dengan password lama — assert gagal

2. **Reset password dengan token tidak valid**
   - Assert: HTTP 400, `meta.message` = "token tidak valid"

3. **Reset password dengan token expired**
   - Seed verification token expired
   - Assert: HTTP 400, `meta.message` = "token sudah kedaluwarsa"

4. **Reset password dengan password lama salah**
   - Seed user + verification token valid
   - Kirim request dengan old_password yang salah
   - Assert: HTTP 401, `meta.message` = "email atau password salah"

5. **Reset password dengan body tidak valid**
   - Assert: HTTP 400

---

### Tahap 9 — Test Me (Get Current User)

Buat function `TestMe` dengan sub-test. Awal function test, panggil `cleanupDatabase(db)`.

1. **Me dengan token valid**
   - Seed user
   - Login untuk mendapatkan token
   - Kirim `GET /lms-usti-api/auth/me` dengan Bearer token
   - Assert: HTTP 200, `data.email`, `data.role`, `data.fullname` sesuai

2. **Me tanpa token**
   - Kirim request tanpa Authorization header
   - Assert: HTTP 401

3. **Me dengan token tidak valid**
   - Kirim Authorization header dengan token random
   - Assert: HTTP 401

---

## File yang Terlibat

| File | Aksi |
|------|------|
| `lms-usti-be/main_auth_test.go` | **Buat baru** — semua test auth |
| `lms-usti-be/go.mod` | **Edit** — tambah `gorm.io/driver/sqlite` jika pakai SQLite |

---

## Cara Menjalankan Test

```bash
# Dari direktori lms-usti-be/
go test -v -run TestAuth ./...
```

Atau untuk test spesifik:

```bash
go test -v -run TestLogin ./...
go test -v -run TestRegister ./...
```

---

## Urutan Eksekusi

```
Tahap 1 (setup infrastructure)    ← harus duluan
Tahap 2 (helpers)                  ← harus setelah tahap 1
Tahap 3 (register test)           ← independen (setelah 1 & 2)
Tahap 4 (login test)              ← independen (setelah 1 & 2)
Tahap 5 (activation test)         ← independen (setelah 1 & 2)
Tahap 6 (resend test)             ← independen (setelah 1 & 2)
Tahap 7 (reset email test)        ← independen (setelah 1 & 2)
Tahap 8 (new password test)       ← independen (setelah 1 & 2)
Tahap 9 (me test)                 ← independen (setelah 1 & 2)
```

> **Tip:** Tahap 3-9 bisa dikerjakan secara paralel karena masing-masing test function independen (setiap function punya setup sendiri-sendiri).

---

## Catatan untuk Implementer

- **Setiap sub-test harus independen.** Jangan bergantung pada data yang dibuat di sub-test lain. Setiap sub-test harus seed data sendiri.
- **`cleanupDatabase` wajib dipanggil di awal setiap function test.** Ini memastikan tidak ada sisa data dari test sebelumnya yang mengganggu. Meskipun SQLite in-memory hilang otomatis, kebiasaan ini penting jika nanti migrasi ke test database yang persist.
- **Urutan cleanupDatabase:** Hapus `verification_tokens` dulu baru `users` (karena foreign key constraint). Gunakan `db.Exec("DELETE FROM ...")`.
- **Gunakan `t.Run()`** untuk sub-test agar output lebih rapi dan mudah dilacak saat ada yang fail.
- **Untuk test `/me`**, diperlukan token JWT asli. Bisa didapat dengan login dulu di dalam test, atau membuat token langsung menggunakan `lib.CreateToken()`.
- **Untuk test activation,** gunakan token dari hasil `seedVerificationToken` — jangan hardcode.
- **Test harus bisa jalan tanpa MySQL.** Jika pakai SQLite in-memory, pastikan driver SQLite sudah diinstall.
- **Jangan test pengiriman email yang sebenarnya.** Fungsi `lib.SendVerificationEmail` akan mencoba kirim email via SMTP. Test harusnya hanya meng-assert response dari controller, bukan mengecek email benar-benar terkirim. Gunakan mock atau pastikan error dari `lib.SendVerificationEmail` di-handle dengan benar: di test, seharusnya return error "email not sent" jika SMTP tidak available.
- **Setiap function test harus clean up** setelah selesai — meskipun menggunakan database in-memory yang otomatis hilang setelah test selesai.
- **Gunakan `httptest.NewRecorder()`** untuk menangkap response, lalu `httptest.NewRequest()` untuk membuat request.
