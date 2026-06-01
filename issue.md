# Issue: Unit Test Fitur Assignment Management Backend

## Goal

Membuat unit test untuk fitur assignment management backend menggunakan `net/http/httptest` mengikuti pattern dari [Gin Testing Guide](https://gin-gonic.com/id/docs/testing/). File test: `main_assignment_test.go`.

---

## Arsitektur Test

**Flow test untuk setiap function:**
```
1. cleanupDatabase(db)     ← bersihkan data lama
2. seed data test          ← buat user DOSEN + MAHASISWA, classroom, assignment
3. generate token          ← untuk akses route protected
4. buat request            ← kirim request via httptest
5. assert response         ← cek status code dan body
```

**Route assignment:**
- `POST /classroom/:id/assignments` — Create (DOSEN only)
- `GET /classroom/:id/assignments` — FindAll
- `GET /classroom/:id/assignments/:assignmentId` — FindById
- `PUT /classroom/:id/assignments/:assignmentId` — Update (DOSEN only)
- `DELETE /classroom/:id/assignments/:assignmentId` — Delete (DOSEN only)

**Catatan penting:**
- Semua route under `/classroom` memerlukan auth middleware
- Create, Update, Delete juga memerlukan ACL middleware (DOSEN only)
- Create otomatis membuat submissions "not_submitted" untuk semua mahasiswa di classroom
- `AssignmentRequest` menggunakan JSON binding (`ShouldBindJSON`)
- `Deadline` field format: `"2026-12-31T23:59:00Z"`

---

## Tahapan

### Tahap 1 — Setup Infrastructure

Buat file `lms-usti-be/main_assignment_test.go`.

**1. Setup Router dengan Assignment Routes**

Update `setupTestRouter` di `main_auth_test.go` (atau buat versi baru) — tambahkan assignment routes:

```
classroom.GET("/:id/assignments", assignmentController.FindAll)
classroom.GET("/:id/assignments/:assignmentId", assignmentController.FindById)
classroom.POST("/:id/assignments", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Create)
classroom.PUT("/:id/assignments/:assignmentId", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Update)
classroom.DELETE("/:id/assignments/:assignmentId", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Delete)
```

**Catatan:** `cleanupDatabase` harus juga menghapus `assignment_rubrics` dan `materials` jika belum ada.

**2. Helper Functions**

```go
func seedAssignment(db *gorm.DB, classroomId, title string) model.Assignment
```
- Buat assignment dengan classroomId yang diberikan
- `Deadline`: `time.Date(2026, 12, 31, 23, 59, 0, 0, time.UTC)`
- `Instruction`: string hardcoded
- Return assignment (untuk dapat ID-nya)

---

### Tahap 2 — Test Create Assignment

Function: `TestCreateAssignment`

1. **Create berhasil** — 200, "assignment berhasil dibuat", cek assignment ada di DB
2. **Create dengan title kosong** — 400, validation error
3. **Create dengan deadline kosong** — 400, validation error
4. **Create tanpa token** — 401
5. **Create dengan token MAHASISWA** — 401 (ACL reject)
6. **Create dengan classroomId tidak ada** — 404, "kelas tidak ditemukan"
7. **Create dengan rubrics** — 200, cek rubrics tersimpan di DB

---

### Tahap 3 — Test FindAll Assignment

Function: `TestFindAllAssignment`

1. **FindAll berhasil** — 200, "berhasil mengambil semua assignment", ada data
2. **FindAll classroom kosong** — 200, data kosong (array kosong)
3. **FindAll dengan classroomId tidak ada** — 404, "kelas tidak ditemukan"
4. **FindAll tanpa token** — 401
5. **FindAll dengan multiple assignments** — 200, cek jumlah data benar

---

### Tahap 4 — Test FindById Assignment

Function: `TestFindAssignmentById`

1. **FindById berhasil** — 200, "berhasil mengambil assignment", data + rubrics
2. **FindById dengan assignmentId tidak ada** — 404, "assignment tidak ditemukan"
3. **FindById dengan classroomId berbeda** — 404 (assignment tidak dikenali di classroom lain)
4. **FindById tanpa token** — 401

---

### Tahap 5 — Test Update Assignment

Function: `TestUpdateAssignment`

1. **Update berhasil** — 200, "assignment berhasil diperbarui"
2. **Update hanya title (partial update)** — 200, field lain tidak berubah
3. **Update dengan assignmentId tidak ada** — 404, "assignment tidak ditemukan"
4. **Update tanpa token** — 401
5. **Update dengan token MAHASISWA** — 401 (ACL reject)
6. **Update rubrics** — 200, cek rubrics lama terhapus, rubrics baru tersimpan

---

### Tahap 6 — Test Delete Assignment

Function: `TestDeleteAssignment`

1. **Delete berhasil** — 200, "assignment berhasil dihapus", cek assignment tidak ada di DB
2. **Delete dengan assignmentId tidak ada** — 404, "assignment tidak ditemukan"
3. **Delete tanpa token** — 401
4. **Delete dengan token MAHASISWA** — 401 (ACL reject)

---

## File yang Terlibat

| File | Aksi |
|------|------|
| `lms-usti-be/main_assignment_test.go` | **Buat baru** |
| `lms-usti-be/main_auth_test.go` | **Edit** — tambah assignment routes di `setupTestRouter`, tambah `assignment_rubrics` di `cleanupDatabase` |
| `lms-usti-be/go.mod` | **Cek** — pastikan `gorm.io/driver/sqlite` sudah ada |

---

## Catatan Penting

- **`cleanupDatabase` wajib dipanggil di awal setiap sub-test** via `t.Run()`.
- **Setiap sub-test harus independen** — seed data sendiri-sendiri.
- **Untuk route Create/Update/Delete** — login sebagai DOSEN.
- **`AssignmentRequest` menggunakan JSON binding** — kirim via `Content-Type: application/json`.
- **`Deadline` harus format ISO 8601** — contoh: `"2026-12-31T23:59:00Z"`.
- **Create otomatis membuat submissions** — jika ada mahasiswa di classroom. Untuk test simpel, cukup buat classroom tanpa mahasiswa.
- **Timeout test** — pastikan tidak ada operasi berat. SQLite in-memory sudah cukup cepat.
- **Helper `seedAssignment`** — buat di file test ini sendiri (jangan di `main_auth_test.go`).
- **Auto-migrate** — pastikan `AssignmentRubric` dan `ClassroomMahasiswa` termasuk di `setupTestDB`.
