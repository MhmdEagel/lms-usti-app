# Issue: Refactor Attachment — Material & Assignment Backend

## Goal

Menyederhanakan sistem attachment pada material dan assignment menjadi satu model masing-masing. Menambah tipe VIDEO. Refactor backend saja, front-end diabaikan.

---

## Arsitektur Baru

### Model Lama vs Baru

**Lama (Material):**
- `MaterialFile` — tabel terpisah (ID, FileName, UniqueFileName, FileUrl, MaterialId)
- `MaterialLink` — tabel terpisah (ID, LinkName, LinkUrl, MaterialId)

**Baru (Material):**
- `MaterialAttachment` — satu tabel gabungan:
  - `ID` (primary key)
  - `Name` (string)
  - `Type` (enum: FILE, VIDEO, LINK)
  - `Url` (string)
  - `UniqueName` (string)
  - `MaterialId` (FK)

**Lama (Assignment):**
- Tidak ada attachment (hanya Rubrics)

**Baru (Assignment):**
- `AssignmentAttachment` — satu tabel:
  - `ID` (primary key)
  - `Name` (string)
  - `Type` (enum: FILE, VIDEO, LINK)
  - `Url` (string)
  - `UniqueName` (string)
  - `AssignmentId` (FK)

### Enum Type

```go
type AttachmentType string

const (
    AttachmentTypeFile  AttachmentType = "FILE"
    AttachmentTypeVideo AttachmentType = "VIDEO"
    AttachmentTypeLink  AttachmentType = "LINK"
)
```

### Validasi Type

| Type | Validasi |
|------|----------|
| FILE | `UniqueName` wajib ada, `Url` wajib ada, ekstensi: jpg, jpeg, png, gif, webp, pdf, doc, docx, txt |
| VIDEO | `UniqueName` wajib ada, `Url` wajib ada, ekstensi: mp4, mkv |
| LINK | `UniqueName` kosong, `Url` wajib ada (harus valid URL) |

---

## Tahapan

### Tahap 1 — Buat Model `AttachmentType` + `MaterialAttachment`

**File:** `lms-usti-be/model/material.go`

1. Buat type `AttachmentType string` dengan enum `FILE`, `VIDEO`, `LINK`
2. Buat struct `MaterialAttachment` dengan field: `ID`, `Name`, `Type` (AttachmentType), `Url`, `UniqueName`, `MaterialId`
3. Tambah `BeforeCreate` hook untuk auto-generate UUID
4. Hapus `MaterialFile` dan `MaterialLink` structs
5. Update struct `Material` — ganti `MaterialFiles` dan `MaterialLinks` menjadi `Attachments []MaterialAttachment` dengan foreign key cascade
6. Hapus `NewMaterialLink` function

---

### Tahap 2 — Buat Model `AssignmentAttachment`

**File:** `lms-usti-be/model/assignment.go`

1. Buat struct `AssignmentAttachment` dengan field: `ID`, `Name`, `Type` (AttachmentType), `Url`, `UniqueName`, `AssignmentId`
2. Tambah `BeforeCreate` hook untuk auto-generate UUID
3. Update struct `Assignment` — tambah field `Attachments []AssignmentAttachment` dengan foreign key cascade

---

### Tahap 3 — Buat Tipe Data Attachment di `data/`

**File:** `lms-usti-be/data/attachment.go` (buat baru)

1. Buat `AttachmentRequest` — untuk Create/Update:
   ```go
   type AttachmentRequest struct {
       Name       string         `json:"name" binding:"required"`
       Type       string         `json:"type" binding:"required,oneof=FILE VIDEO LINK"`
       Url        string         `json:"url" binding:"required"`
       UniqueName string         `json:"unique_name"`
   }
   ```

2. Buat `AttachmentResponse` — untuk response:
   ```go
   type AttachmentResponse struct {
       Id         string `json:"id"`
       Name       string `json:"name"`
       Type       string `json:"type"`
       Url        string `json:"url"`
       UniqueName string `json:"unique_name"`
   }
   ```

3. Update `data/material.go`:
   - `MaterialRequest.Files` → `MaterialRequest.Attachments []AttachmentRequest`
   - `MaterialRequest.Links` → dihapus
   - `MaterialDetailResponse.Files` + `.Links` → `MaterialDetailResponse.Attachments []AttachmentResponse`
   - `MaterialUpdateRequest.Files` + `.Links` → `MaterialUpdateRequest.Attachments []AttachmentRequest`
   - Hapus `FileRequest`, `FileResponse`, `LinkRequest`, `LinkResponse`

4. Update `data/assignment.go`:
   - `AssignmentRequest.Attachments []AttachmentRequest`
   - `AssignmentDetailResponse.Attachments []AttachmentResponse`
   - `AssignmentUpdateRequest.Attachments []AttachmentRequest`

---

### Tahap 4 — Update Repository Material

**File:** `lms-usti-be/repositories/material_repository.go`

1. Hapus `CreateMaterialFile`, `CreateMaterialLink`, `DeleteFiles`, `DeleteLinks`, `DeleteFileByUniqueFileName`
2. Tambah `CreateAttachments(attachments []model.MaterialAttachment) error`
3. Tambah `DeleteAttachments(materialId string) error`
4. Update `FindById` — ganti `Preload("MaterialFiles").Preload("MaterialLinks")` menjadi `Preload("Attachments")`
5. Update interface `MaterialRepositoryInterface` — sesuaikan method baru

---

### Tahap 5 — Update Repository Assignment

**File:** `lms-usti-be/repositories/assignment_repository.go`

1. Tambah `CreateAttachments(attachments []model.AssignmentAttachment) error`
2. Tambah `DeleteAttachments(assignmentId string) error`
3. Update `FindById` — tambah `Preload("Attachments")`
4. Update interface `AssignmentRepositoryInterface` — sesuaikan method baru

---

### Tahap 6 — Update Service Material

**File:** `lms-usti-be/services/material_service.go`

1. Update `Create`:
   - Loop `materialRequest.Attachments`
   - Validasi type: cek `AttachmentType(req.Type)` valid (FILE/VIDEO/LINK)
   - Jika FILE/VIDEO: pastikan `UniqueName` tidak kosong
   - Jika LINK: `UniqueName` boleh kosong, pastikan `Url` valid URL
   - Konversi ke `[]model.MaterialAttachment` dengan `Type` field

2. Update `FindById`:
   - Loop `res.Attachments` → konversi ke `[]data.AttachmentResponse`

3. Update `Update`:
   - Hapus logic lama (DeleteLinks, CreateMaterialLink, DeleteFiles, CreateMaterialFile)
   - Ganti dengan: `repo.DeleteAttachments(material.ID)` → `repo.CreateAttachments(updatedAttachments)`

4. Hapus `fmt.Println` debug (line 38)

---

### Tahap 7 — Update Service Assignment

**File:** `lms-usti-be/services/assignment_service.go`

1. Update `Create`:
   - Setelah create rubrics dan submissions
   - Loop `assignmentRequest.Attachments`
   - Validasi type sama seperti material
   - Konversi ke `[]model.AssignmentAttachment`
   - Call `repo.CreateAttachments()`

2. Update `FindById`:
   - Loop `res.Attachments` → konversi ke `[]data.AttachmentResponse`

3. Update `Update`:
   - Hapus logic rubrics lama
   - Tambah: `repo.DeleteAttachments(assignment.ID)` → `repo.CreateAttachments(updatedAttachments)`

---

### Tahap 8 — Tambah Video Type ke File Detection

**File:** `lms-usti-be/lib/uploads.go`

1. Tambah `FileTypeVideo FileType = "video"`
2. Update `GetUploadConfig` — tambah `FileTypeVideo: []string{"mp4", "mkv"}`

**File:** `lib/utils.go`

1. Update `DetectFileType` — tambah deteksi `.mp4`, `.mkv` → `FileTypeVideo`
2. Update `IsAllowedFileType` — tambah case `FileTypeVideo`: `mp4, mkv`

---

### Tahap 9 — Hapus Migration Lama + Buat Migration Baru

**File:** `lms-usti-be/config/database.go` atau migration file

1. Drop tabel lama: `material_files`, `material_links`
2. Buat tabel baru: `material_attachments`, `assignment_attachments`
3. Update auto-migrate di test setup jika ada

---

## Urutan Pengerjaan

| Tahap | File | Dependensi |
|-------|------|------------|
| 1 | `model/material.go` | — |
| 2 | `model/assignment.go` | — |
| 3 | `data/attachment.go`, `data/material.go`, `data/assignment.go` | Tahap 1, 2 |
| 4 | `repositories/material_repository.go` | Tahap 1 |
| 5 | `repositories/assignment_repository.go` | Tahap 2 |
| 6 | `services/material_service.go` | Tahap 1, 3, 4 |
| 7 | `services/assignment_service.go` | Tahap 2, 3, 5 |
| 8 | `lib/uploads.go`, `lib/utils.go` | — |
| 9 | Migration database | Tahap 1-8 |

**Tips:** Tahap 1-2 bisa paralel. Tahap 3 tergantung 1+2. Tahap 4-5 bisa paralel. Tahap 6-7 bisa paralel. Tahap 8 independent. Tahap 9 terakhir.

---

## File yang Terlibat

| File | Aksi |
|------|------|
| `model/material.go` | Edit — ganti MaterialFile/MaterialLink → MaterialAttachment |
| `model/assignment.go` | Edit — tambah AssignmentAttachment |
| `data/attachment.go` | **Buat baru** — AttachmentRequest, AttachmentResponse |
| `data/material.go` | Edit — ganti Files/Links → Attachments |
| `data/assignment.go` | Edit — tambah Attachments field |
| `repositories/material_repository.go` | Edit — ganti methods |
| `repositories/assignment_repository.go` | Edit — tambah attachment methods |
| `services/material_service.go` | Edit — refactor create/update/find |
| `services/assignment_service.go` | Edit — tambah attachment handling |
| `lib/uploads.go` | Edit — tambah FileTypeVideo |
| `lib/utils.go` | Edit — tambah deteksi video |

---

## Referensi

- Pola model: `model/material.go` (MaterialFile/MaterialLink lama)
- Pola enum: `lib/uploads.go` (FileType)
- Pola repository: `repositories/material_repository.go`
- Pola service create: `services/material_service.go:25-69`
