# Issue: Bangun Error Handling Konsisten untuk Fitur Login

## Goal

Membangun sistem error handling yang terstruktur dan konsisten di backend Go, dimulai dari fitur login. Sistem ini harus bisa diikuti oleh junior programmer atau model AI dengan instruksi high-level.

---

## Tahapan

### Tahap 1 — Buat Object Construction Global di `data/error.go`

Buat file baru: `lms-usti-be/data/error.go`

Di dalam file ini, buat satu struct error global yang akan jadi standar di seluruh aplikasi:

- **Nama struct:** `AppError`
- **Field yang harus ada:**
  - `Code` (int) — HTTP status code, misal 400, 401, 404, 500
  - `Message` (string) — Pesan yang akan dikirim ke client (jangan pernah kirim raw error message)
  - `Err` (error) — Error asli untuk keperluan logging di server (tidak dikirim ke client)
- **Method:** Buat method pada `AppError` yang mengembalikan `Error()` string agar bisa dipakai sebagai interface `error` di Go
- **Constructor:** Buat fungsi `NewAppError(code int, message string, err error) *AppError` untuk instance baru

**Contoh kode yang diharapkan (bukan final, hanya ilustrasi):**

```go
type AppError struct {
    Code    int
    Message string
    Err     error
}

func (e *AppError) Error() string { ... }
func NewAppError(code int, message string, err error) *AppError { ... }
```

---

### Tahap 2 — Buat Kumpulan Sentinel Error di Auth

Masih di file `data/error.go`, buat variable global (sentinel error) yang merepresentasikan error spesifik fitur auth/login:

- `ErrInvalidCredentials` — Status 401, message "email atau password salah"
- `ErrEmailAlreadyExist` — Status 409, message "email sudah terdaftar"
- `ErrEmailNotFound` — Status 404, message "email tidak ditemukan"
- `ErrAccountNotVerified` — Status 403, message "akun belum diverifikasi"
- `ErrInvalidToken` — Status 400, message "token tidak valid"
- `ErrTokenExpired` — Status 400, message "token sudah kedaluwarsa"

> **Catatan penting:** Setiap sentinel error ini harus sudah mengandung HTTP status code dan pesan yang siap dikirim ke client. Error asli (raw error) tidak perlu disimpan di sentinel — cukup di-wrap saat dipakai.

---

### Tahap 3 — Update `data/response.go`

Saat ini fungsi `NewResponse` menerima `int` untuk status code. Tambahkan fungsi baru yang menerima `*AppError` sebagai parameter agar response bisa dibuat langsung dari AppError tanpa harus extract field satu-satu.

**Contoh:**

```go
func NewResponseFromError(appErr *AppError) Response { ... }
```

Fungsi ini cukup extract `Code` dan `Message` dari `AppError` lalu kembalikan `Response` struct yang sudah ada.

---

### Tahap 4 — Refactor Auth Service (Login Only dulu)

Buka `services/auth_service.go`, fokus pada fungsi `Login` saja.

**Yang harus diubah:**

1. Hapus semua `errors.New("...")` yang ada di dalam fungsi `Login`
2. Ganti dengan return sentinel error dari `data` package, misal:
   - Jika user tidak ditemukan → return `data.ErrInvalidCredentials`
   - Jika password salah → return `data.ErrInvalidCredentials`
   - Jika token gagal dibuat → return `AppError` baru dengan code 500 dan message "gagal membuat token"
3. Pastikan semua error yang di-return sudah bertipe `*data.AppError`

> **Prinsip:** Service layer hanya mengembalikan error. Tidak ada HTTP code atau JSON response di sini. Itu urusan controller.

---

### Tahap 5 — Refactor Auth Controller (Login Only dulu)

Buka `controllers/auth_controller.go`, fokus pada fungsi `Login` saja.

**Yang harus diubah:**

1. Cek apakah error yang dikembalikan service adalah `*data.AppError` (pakai type assertion)
2. Jika ya → gunakan `NewResponseFromError(appErr)` untuk membuat response
3. Jika tidak (error tak terduga) → buat `AppError` baru dengan code 500 dan message generik "terjadi kesalahan server"
4. Kirim response menggunakan status code dari AppError, bukan hardcoded 400

**Prinsip penting:**
- Controller tidak pernah kirim `err.Error()` ke client
- Controller selalu punya fallback error 500 untuk error tak terduga
- Status code response **harus selalu match** dengan jenis error

---

### Tahap 6 — Refactor Fungsi Auth Lainnya (Register, Activate, ResetPassword)

Setelah login selesai dan tested, terapkan pola yang sama ke fungsi-fungsi auth lainnya di service dan controller:

- `Register` di `auth_service.go` dan `auth_controller.go`
- `Activate` di `auth_service.go` dan `auth_controller.go`
- `SendVerificationEmail` di `auth_service.go` dan `auth_controller.go`
- `ResetPassword` di `auth_service.go` dan `auth_controller.go`

Prinsip yang sama: service return `*AppError`, controller convert ke response.

---

### Tahap 7 — Refactor Auth Middleware

Buka `middleware/auth.go`.

**Yang harus diubah:**

1. Gunakan `*data.AppError` untuk response error (missing header, invalid token, dll)
2. Pastikan semua error response menggunakan format `NewResponseFromError`
3. Gunakan `appErr.Code` sebagai status code HTTP, bukan hardcoded value

---

### Tahap 8 — Handling di Frontend

Buka `lib/axios.ts` dan `useLogin.ts`.

**Yang harus diubah di Axios:**
1. Tambahkan response error interceptor yang handle error berdasarkan `meta.status` dari response
2. Jika status 401 → redirect ke `/auth/login` (kecuali sedang di halaman login)
3. Jika status 500 → tampilkan generic error toast

**Yang harus diubah di `useLogin.ts`:**
1. Ambil `err.response?.data.meta.message` sebagai pesan error
2. Jika tidak ada message → fallback ke "Terjadi kesalahan, coba lagi"

---

## File yang Terlibat

| File | Aksi |
|------|------|
| `lms-usti-be/data/error.go` | **Buat baru** — AppError struct + sentinel errors |
| `lms-usti-be/data/response.go` | **Edit** — tambah `NewResponseFromError` |
| `lms-usti-be/services/auth_service.go` | **Edit** — refactor error di fungsi Login (dan fungsi auth lainnya) |
| `lms-usti-be/controllers/auth_controller.go` | **Edit** — refactor error handling di fungsi Login (dan fungsi auth lainnya) |
| `lms-usti-be/middleware/auth.go` | **Edit** — refactor error handling |
| `lms-usti-fe/src/lib/axios.ts` | **Edit** — tambah error interceptor |
| `lms-usti-fe/src/components/views/Auth/Login/useLogin.ts` | **Edit** — perbaiki error handling |

---

## Cara Test

1. **Login berhasil** → response 200 dengan `access_token`
2. **Login dengan email salah** → response 401 dengan message "email atau password salah"
3. **Login dengan password salah** → response 401 dengan message "email atau password salah" (pesan sama, jangan bocorkan mana yang salah)
4. **Login dengan body kosong/tidak valid** → response 400 dengan validation message
5. **Login saat server error (DB down)** → response 500 dengan message "terjadi kesalahan server"
6. **Pastikan tidak ada raw `err.Error()` yang bocor ke response client**
7. **Pastikan error logging di server tetap mencatat error asli untuk debugging**

---

## Catatan untuk Implementer

- **Jangan ubah response format yang sudah ada.** Struktur `{ meta: { status, message }, data }` harus tetap sama. Yang berubah hanya cara membangunnya.
- **Prioritas: login dulu.** Jangan refactor semua auth sekaligus. Selesaikan login, test, baru lanjut ke fungsi lain.
- **Jangan hapus error handling lama sebelum yang baru working.** Bisa dilakukan incremental — comment dulu jika perlu.
- **Setiap `AppError` yang dikembalikan dari service harus sudah punya HTTP status code yang benar.** Ini adalah aturan utama.
