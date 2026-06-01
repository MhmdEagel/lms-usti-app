# Issue: Perbaikan Bug & Error Handling Material dan Assignment API Backend

## Goal

Perbaiki bug dan error handling pada material dan assignment API agar konsisten dengan pattern yang sudah ada di assignment controller/service dan auth controller.

**Fokus:** Backend only (Go/Gin). Frontend diabaikan.

**File yang diubah:**
- `lms-usti-be/data/error.go`
- `lms-usti-be/data/material.go`
- `lms-usti-be/controllers/material_controller.go`
- `lms-usti-be/controllers/assignment_controller.go`
- `lms-usti-be/services/material_service.go`
- `lms-usti-be/services/assignment_service.go`
- `lms-usti-be/repositories/material_repository.go`

**Referensi pattern (sudah benar):**
- Assignment controller: `controllers/assignment_controller.go` — sudah pakai `handleError()`
- Assignment service: `services/assignment_service.go` — sudah pakai `data.ErrClassroomNotFound()` dan `data.ErrAssignmentNotFound()`
- `handleError()` / `bindJSONError()`: `controllers/auth_controller.go:22-45`

---

## Bug List

| # | Severity | Lokasi | Deskripsi |
|---|----------|--------|-----------|
| 1 | HIGH | `material_controller.go` | Error leak ke client via `err.Error()` |
| 2 | HIGH | `material_service.go` | Raw error dari `classroomRepository.FindById` tanpa `AppError` wrapping |
| 3 | HIGH | `material_service.go` | Raw error dari `materialRepository.FindById` / `Delete` tanpa `AppError` wrapping |
| 4 | HIGH | `material_controller.go` | Error handling manual (`errors.Is` + `err.Error()`) bukan `handleError()` |
| 5 | MEDIUM | `material_service.go` | `Delete(materialId)` tidak terima `classroomId` — tidak bisa verifikasi ownership |
| 6 | MEDIUM | `material_controller.go` | `ShouldBind` (form) bukan `ShouldBindJSON` — binding tidak konsisten |
| 7 | MEDIUM | `data/material.go` | Tag `form:` bukan `json:` — harus match dengan binding method |
| 8 | MEDIUM | `assignment_service.go` | `Create` tidak buat attachment meski field `Attachments` tersedia di request |
| 9 | MEDIUM | `material_service.go` + `assignment_service.go` | `Update` tidak validasi attachment type |
| 10 | LOW | `material_controller.go` | Response message bahasa Inggris — tidak konsisten dengan assignment controller |

---

## Tahapan

### Tahap 1 — Tambah `ErrMaterialNotFound` di `data/error.go`

**Apa:** Tambah sentinel error baru untuk material tidak ditemukan.

**Cara:**
- Tambah fungsi `ErrMaterialNotFound(err error) *AppError` di `data/error.go`
- Ikuti pattern yang sama dengan `ErrAssignmentNotFound`
- Message: `"material tidak ditemukan"`

---

### Tahap 2 — Perbaiki error wrapping di `services/material_service.go`

**Apa:** Semua error dari repository harus di-wrap dengan `AppError` yang sesuai.

**Cara:**
- **Create** (line 28-29): Ganti `return err` jadi `return data.ErrClassroomNotFound(err)` untuk error dari `classroomRepository.FindById`
- **FindAll** (line 72-74): Ganti `return []data.MaterialResponse{}, err` jadi `return nil, data.ErrClassroomNotFound(err)`
- **FindById** (line 94-96): Ganti `return material, err` jadi `return material, data.ErrClassroomNotFound(err)` untuk error classroom
- **FindById** (line 98-100): Ganti `return material, err` jadi `return material, data.ErrMaterialNotFound(err)` untuk error material
- **FindById** (line 102): Ganti `return material, gorm.ErrRecordNotFound` jadi `return material, data.ErrMaterialNotFound(nil)`
- **Update** (line 122-124): Ganti `return err` jadi `return data.ErrClassroomNotFound(err)` untuk error classroom
- **Update** (line 127-128): Ganti `return err` jadi `return data.ErrMaterialNotFound(err)` untuk error material
- **Delete** (line 159-163): Ganti `return err` jadi `return data.ErrMaterialNotFound(err)`

**Catatan:** Setelah tahap ini, import `"gorm.io/gorm"` di `material_service.go` bisa dihapus (sudah tidak pakai `gorm.ErrRecordNotFound`).

---

### Tahap 3 — Tambah `classroomId` ke `Delete` di material

**Apa:** Material Delete harus terima `classroomId` supaya bisa verifikasi ownership, sama seperti assignment.

**Cara:**
- **Interface** (`services/material_service.go`): Ganti `Delete(materialId string)` jadi `Delete(materialId, classroomId string)`
- **Service** (`services/material_service.go`):
  - Terima `classroomId` parameter baru
  - Validasi classroom existence dulu (pakai `classroomRepository.FindById`)
  - Kirim `classroomId` ke repository
- **Repository interface** (`repositories/material_repository.go`): Ganti `Delete(materialId string)` jadi `Delete(materialId, classroomId string)`
- **Repository** (`repositories/material_repository.go`): Update query `WHERE id = ? AND classroom_id = ?` — tambah `RowsAffected == 0` check
- **Controller** (`controllers/material_controller.go`): Baca `classroomId` dari `ctx.Param("id")`, kirim ke service

---

### Tahap 4 — Refactor `material_controller.go` ke `handleError()`

**Apa:** Hapus semua error handling manual dan ganti dengan `handleError()`. Ikuti pola yang sama dengan assignment controller.

**Cara:**
- **Create**: Hapus blok `errors.Is(err, gorm.ErrRecordNotFound)` dan `err.Error()`. Ganti dengan `handleError(c, err)`.
- **FindAll**: Sama — hapus manual error handling, pakai `handleError(c, err)`
- **FindById**: Sama
- **Update**: Sama
- **Delete**: Sama — tambahkan `classroomId` ke parameter service call
- **Binding error**: Ganti `c.ShouldBind` jadi `c.ShouldBindJSON` (lihat Tahap 5)
- **Hapus imports** yang tidak dipakai: `"errors"`, `"gorm.io/gorm"`, `"github.com/go-playground/validator/v10"`

---

### Tahap 5 — Fix binding di `data/material.go` dan `material_controller.go`

**Apa:** Material Create/Update harus pakai JSON binding seperti assignment, bukan form binding.

**Cara:**
- **`data/material.go`**: Ganti semua tag `form:` jadi `json:` di `MaterialRequest` dan `MaterialUpdateRequest`
- **`material_controller.go` Create**: Ganti `c.ShouldBind(&req)` jadi `c.ShouldBindJSON(&req)`
- **`material_controller.go` Update**: Sama — `c.ShouldBind` → `cShouldBindJSON`
- **`material_controller.go`**: Ganti binding error handling dari manual jadi `bindJSONError(c, err)` (helper yang sama seperti auth controller)

**Catatan:** Setelah ini, import `lib` di `material_controller.go` bisa dihapus (tidak pakai `lib.GetValidationMessage` langsung).

---

### Tahap 6 — Fix attachment creation di assignment `Create`

**Apa:** `assignment_service.go` Create method tidak buat attachment meski request punya field `Attachments`.

**Cara:**
- **`assignment_service.go` Create** (setelah loop rubrics, sebelum submission):
  - Loop `assignmentRequest.Attachments`
  - Validasi type (FILE/VIDEO/LINK) — ikuti pattern validasi di material service Create
  - Validasi `UniqueName` untuk FILE/VIDEO, validasi URL untuk LINK
  - Append ke `[]model.AssignmentAttachment`
  - Call `repo.CreateAttachments(attachments)` jika ada
- **`assignment_service.go` Update**: Tambah validasi attachment type juga (lihat Tahap 7)

---

### Tahap 7 — Tambah validasi attachment type di `Update`

**Apa:** Method `Update` di material dan assignment service tidak validasi type attachment.

**Cara:**
- **`material_service.go` Update**: Di loop `updatedAttachments`, tambahkan validasi yang sama seperti Create:
  - Cek type harus `FILE`, `VIDEO`, atau `LINK`
  - Cek `UniqueName` wajib untuk FILE/VIDEO
  - Cek URL valid untuk LINK
- **`assignment_service.go` Update**: Tambahkan validasi yang sama di loop `updatedAttachments`

---

### Tahap 8 — Standardisasi response message ke bahasa Indonesia

**Apa:** Material controller pakai bahasa Inggris, assignment controller pakai bahasa Indonesia.

**Cara:**
- **`material_controller.go`**: Ganti semua message:
  - `"material successfully created"` → `"material berhasil dibuat"`
  - `"success find all materials"` → `"berhasil mengambil semua material"`
  - `"success find material by id"` → `"berhasil mengambil material"`
  - `"material successfully updated"` → `"material berhasil diperbarui"`
  - `"material successfully deleted"` → `"material berhasil dihapus"`

---

## File yang Terlibat

| File | Tahap | Aksi |
|------|-------|------|
| `data/error.go` | 1 | Tambah `ErrMaterialNotFound` |
| `services/material_service.go` | 2, 3, 7 | Fix error wrapping, tambah `classroomId` ke Delete, validasi attachment di Update |
| `repositories/material_repository.go` | 3 | Update `Delete` — tambah `classroomId` parameter + `RowsAffected` check |
| `controllers/material_controller.go` | 4, 5, 8 | Refactor ke `handleError()`, fix binding, standardisasi message |
| `data/material.go` | 5 | Ganti tag `form:` → `json:` |
| `services/assignment_service.go` | 6, 7 | Tambah attachment creation di Create, validasi attachment type di Update |

---

## Verifikasi

Setelah semua tahap selesai:
1. Run `go build ./...` — pasti compile tanpa error
2. Run `go vet ./...` — tidak ada warning
3. Test manual via Postman/Thunder Client:
   - Create material dengan attachment (pasti attachment tersimpan)
   - Update material (ganti attachment type invalid → harus reject)
   - Delete material (pasti classroom ID divalidasi)
   - Create assignment dengan attachment (pasti attachment tersimpan)
   - Delete assignment yang bukan milik classroom → harus 404
