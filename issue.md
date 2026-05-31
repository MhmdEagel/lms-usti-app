# Issue: Unit Test Fitur Classroom Management Backend

## Goal

Membuat unit test untuk fitur manajemen classroom backend menggunakan `net/http/httptest` mengikuti pattern dari [Gin Testing Guide](https://gin-gonic.com/id/docs/testing/). File test: `main_classroom_test.go`.

---

## Arsitektur Test

**Masalah:** `InitRouter()` memanggil `config.ConnectDatabase()` yang panicking jika tidak ada MySQL.

**Solusi:** Buat `setupTestRouter(db *gorm.DB) *gin.Engine` yang menerima `*gorm.DB` dari SQLite in-memory, bukan dari `config.ConnectDatabase()`.

**Flow test untuk setiap function:**
```
1. cleanupDatabase(db)     ← bersihkan data lama
2. seed data test          ← buat user, classroom, dll
3. buat request            ← kirim request via httptest
4. assert response         ← cek status code dan body
```

**Flow auth untuk test route yang protected:**
```
1. Seed user (dengan role DOSEN atau MAHASISWA)
2. Login user → dapat access_token
3. Kirim request dengan header Authorization: Bearer <token>
```

---

## Tahapan

### Tahap 1 — Setup Infrastructure

Buat file `lms-usti-be/main_classroom_test.go`.

Buat fungsi-fungsi berikut:

1. **`setupTestDB() *gorm.DB`**
   - Buka koneksi ke SQLite in-memory
   - Auto-migrate: `model.User`, `model.Classroom`, `model.ClassroomMahasiswa`, `model.VerificationToken`
   - Return `*gorm.DB`

2. **`cleanupDatabase(db *gorm.DB)`**
   - Hapus semua data dari tabel secara berurutan (foreign key): `submissions`, `assignments`, `materials`, `announcements`, `classroom_mahasiswas`, `classrooms`, `verification_tokens`, `users`

3. **`setupTestRouter(db *gorm.DB) *gin.Engine`**
   - Buat `gin.Default()`
   - Buat repositories, services, controllers dari `db` parameter
   - Register semua classroom routes dengan auth middleware dan ACL middleware
   - Return `*gin.Engine`

4. **Helper functions:**
   - `seedUser(db, fullname, email, password, role string) model.User` — langsung set `EmailVerified` valid (tidak perlu parameter, skip verifikasi)
   - `seedClassroom(db, dosenId, className string) model.Classroom`
   - `loginAndGetToken(router, email, password string) string` — login dan return access_token

---

### Tahap 2 — Test Create Classroom

Function: `TestCreateClassroom`

1. **Create berhasil (DOSEN)** — 200, "successfully create classroom"
2. **Create dengan body kosong** — 400, validation error
3. **Create dengan class_name kurang dari 8 karakter** — 400
4. **Create tanpa token** — 401
5. **Create dengan token MAHASISWA** — 401 (ACL reject)

---

### Tahap 3 — Test FindAllByDosenId

Function: `TestFindAllByDosenId`

1. **Find berhasil** — 200, ada data classrooms
2. **Find tanpa token** — 401
3. **Find dengan token MAHASISWA** — 401 (ACL reject)
4. **Pagination: page 1, limit 2** — Seed 3 classrooms, kirim `?page=1&limit=2`. Assert: 200, `pagination.total` = 3, `pagination.total_pages` = 2, `data` berisi 2 item
5. **Pagination: page 2, limit 2** — Seed 3 classrooms, kirim `?page=2&limit=2`. Assert: 200, `data` berisi 1 item (sisa)
6. **Pagination: page melebihi total** — Seed 3 classrooms, kirim `?page=10&limit=2`. Assert: 200, `data` kosong

---

### Tahap 4 — Test FindAllByMahasiswaId

Function: `TestFindAllByMahasiswaId`

1. **Find berhasil** — 200, ada data classrooms
2. **Find tanpa token** — 401
3. **Find dengan token DOSEN** — 401 (ACL reject)
4. **Pagination: page 1, limit 2** — Seed 3 classroom + enroll mahasiswa, kirim `?page=1&limit=2`. Assert: 200, `pagination.total` = 3, `pagination.total_pages` = 2, `data` berisi 2 item
5. **Pagination: page 2, limit 2** — Seed 3 classroom + enroll mahasiswa, kirim `?page=2&limit=2`. Assert: 200, `data` berisi 1 item
6. **Pagination: tanpa query param** — Seed 3 classroom + enroll mahasiswa, kirim tanpa `?page=&limit=`. Assert: 200, gunakan default pagination (limit 10, page 1)

---

### Tahap 5 — Test FindById

Function: `TestFindClassroomById`

1. **Find berhasil** — 200, classroom data sesuai
2. **Find dengan ID tidak ada** — 404, "classroom not found"
3. **Find tanpa token** — 401

---

### Tahap 6 — Test Update Classroom

Function: `TestUpdateClassroom`

1. **Update berhasil** — 200, "classroom successfully updated"
2. **Update field tertentu saja (partial update)** — 200, field lain tidak berubah
3. **Update dengan ID tidak ada** — 404
4. **Update tanpa token** — 401
5. **Update dengan token MAHASISWA** — 401 (ACL reject)

---

### Tahap 7 — Test Delete Classroom

Function: `TestDeleteClassroom`

1. **Delete berhasil** — 200, "classroom successfully deleted"
2. **Delete dengan ID tidak ada** — 404
3. **Delete dengan dosenId berbeda** — 404 (bukan classroom milik dosen ini)
4. **Delete tanpa token** — 401
5. **Delete dengan token MAHASISWA** — 401 (ACL reject)

---

### Tahap 8 — Test Enroll (Join Classroom)

Function: `TestEnrollClassroom`

1. **Enroll berhasil** — 200, "success join classroom"
2. **Enroll dengan class_code tidak ada** — 404, "kelas tidak ditemukan"
3. **Enroll dua kali** — 409, "sudah bergabung di kelas ini"
4. **Enroll tanpa token** — 401
5. **Enroll dengan token DOSEN** — 401 (ACL reject)

---

### Tahap 9 — Test FindAllClassroomMember

Function: `TestFindAllClassroomMember`

1. **Find berhasil** — 200, ada data dosen dan mahasiswa
2. **Find dengan classroomId tidak ada** — 404
3. **Find tanpa token** — 401

---

## File yang Terlibat

| File | Aksi |
|------|------|
| `lms-usti-be/main_classroom_test.go` | **Buat baru** |
| `lms-usti-be/go.mod` | **Edit** — tambah `gorm.io/driver/sqlite` jika belum ada |

---

## Cara Jalankan

```bash
go test -v -run TestCreateClassroom ./...
go test -v -run TestFindAllByDosenId ./...
```

---

## Catatan Penting

- **`cleanupDatabase` wajib dipanggil di awal setiap function test.** Hapus tabel berurutan sesuai foreign key.
- **Setiap sub-test harus independen** via `t.Run()`. Seed data sendiri-sendiri.
- **Untuk route yang butuh auth**, login dulu via helper `loginAndGetToken` untuk mendapatkan token.
- **Untuk route yang butuh ACL** (DOSEN/MAHASISWA), pastikan login dengan role yang sesuai.
- **Setiap test harus punya pattern yang sama:** cleanup → seed → request → assert.
- **Jangan test SMTP beneran.** Cukup assert response dari controller.
