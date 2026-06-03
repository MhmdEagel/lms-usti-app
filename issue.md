# Issue: Perbaikan Bug & Error Handling Backend (Sisa yang Belum Diperbaiki)

## Goal

Perbaiki bug dan error handling pada material, assignment, dan announcement API yang masih perlu diperbaiki setelah tahap sebelumnya.

**Fokus:** Backend only (Go/Gin). Frontend diabaikan.

**File yang diubah:**
- `lms-usti-be/controllers/announcement_controller.go`
- `lms-usti-be/services/announcement_service.go`
- `lms-usti-be/data/classroom.go`

**Referensi pattern (sudah benar):**
- Assignment controller: `controllers/assignment_controller.go` — sudah pakai `handleError()` dan `bindJSONError()`
- Assignment service: `services/assignment_service.go` — sudah pakai `data.ErrClassroomNotFound()` dan `data.ErrAssignmentNotFound()`
- `handleError()` / `bindJSONError()`: `controllers/auth_controller.go`
- Classroom controller Create: `controllers/classroom_controller.go` — cara extract user dari context

---

## Bug List

| # | Severity | Lokasi | Deskripsi |
|---|----------|--------|-----------|
| 1 | HIGH | `announcement_controller.go` | Create tidak extract `DosenId` dari context — `DosenId` akan kosong → DB FK violation |
| 2 | MEDIUM | `announcement_service.go` | FindAll return raw error dari repository — tidak wrap dengan `AppError` |
| 3 | LOW | `data/classroom.go` | `AnnouncementResponse` tidak ada field `CreatedAt` — beda dengan material/assignment |

---

## Tahapan

### Tahap 1 — Fix `DosenId` tidak terisi di Announcement Create

**Apa:** Controller `Create` tidak extract user dari context. Field `DosenId` di `AnnouncementRequest` tidak punya json binding tag, jadi tidak terisi dari request body. Harus diambil dari JWT token yang sudah di-set oleh auth middleware.

**Cara:**
- **`controllers/announcement_controller.go` Create**: Setelah bind JSON dan sebelum panggil service, tambahkan code untuk ambil user dari context:
  - Baca user dari context: `ctx.Get("user")`
  - Type assert ke `data.MeResponse`
  - Set `req.DosenId = user.UserId`
- Ikuti pola yang sama dengan `controllers/classroom_controller.go` Create

**Catatan:** Ini bug critical — tanpa fix ini, setiap create announcement akan gagal karena foreign key constraint pada `DosenId`.

**Checkpoint:** `go build ./...`

---

### Tahap 2 — Wrap raw error di Announcement FindAll

**Apa:** `announcement_service.go` FindAll return raw error dari repository tanpa AppError wrapping.

**Cara:**
- Ganti `return nil, err` pada error dari `announcementRepository.FindAll` menjadi `return nil, data.ErrInternalServer(err)`

**Checkpoint:** `go build ./...`

---

### Tahap 3 — Tambah `CreatedAt` ke `AnnouncementResponse`

**Apa:** `AnnouncementResponse` tidak punya field `CreatedAt`. Material dan assignment response sudah punya timestamp.

**Cara:**
- **`data/classroom.go`**: Tambah field `CreatedAt string` dengan tag `json:"created_at"` di `AnnouncementResponse`
- **`services/announcement_service.go` FindAll**: Saat mapping response, format `CreatedAt` menggunakan `time.RFC3339Nano` (ikuti pola di material service)
- Tambah import `"time"` di `announcement_service.go` jika belum ada

**Checkpoint:** `go build ./...`

---

## File yang Terlibat

| File | Tahap | Aksi |
|------|-------|------|
| `controllers/announcement_controller.go` | 1 | Tambah user extraction untuk DosenId |
| `services/announcement_service.go` | 2, 3 | Wrap error di FindAll, tambah CreatedAt mapping |
| `data/classroom.go` | 3 | Tambah field CreatedAt di AnnouncementResponse |

---

## Verifikasi

Setelah semua tahap selesai:
1. Run `go build ./...` — pasti compile tanpa error
2. Run `go vet ./...` — tidak ada warning
3. Test manual via Postman/Thunder Client:
   - Create announcement — pasti berhasil dan `created_by` terisi dengan nama dosen
   - FindAll announcement — pasti ada field `created_at` di response
   - Create announcement tanpa token — harus return 401
   - Create announcement dengan role MAHASISWA — harus return 403
