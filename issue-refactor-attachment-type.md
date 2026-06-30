# Issue: Refactor Attachment Type — Hapus VIDEO, Gabung ke FILE

## Goal

Hapus tipe `VIDEO` dari attachment type. Sisa dua tipe saja: `FILE` dan `LINK`. Video tetap dianggap `FILE` — deteksi video dilakukan di frontend berdasarkan ekstensi file (`.mp4`, `.mov`, `.avi`), bukan berdasarkan type.

---

## Kondisi Saat Ini

**Backend:**
- `AttachmentType` didefinisikan di `model/material.go` dengan 3 nilai: `FILE`, `VIDEO`, `LINK`
- `AttachmentRequest` dan `SubmissionAttachmentRequest` punya validasi `binding:"oneof=FILE VIDEO LINK"`
- `MaterialService` dan `AssignmentService` validasi: `FILE`/`VIDEO` harus punya `UniqueName`, `LINK` harus valid URL
- 3 struct pakai `AttachmentType`: `MaterialAttachment`, `AssignmentAttachment`, `SubmissionAttachment`
- Database pakai GORM AutoMigrate — column `type` adalah `VARCHAR(255)`, tidak ada DB-level enum

**Frontend:**
- `IAttachment.type` bertipe `"FILE" | "VIDEO" | "LINK"`
- Zod schema: `type: z.enum(["FILE", "VIDEO", "LINK"])`
- Filter `a.type === "FILE" || a.type === "VIDEO"` muncul di ~15 tempat
- `useSubmitAssignmentDialog.tsx` hardcode `type: "FILE"` untuk semua upload
- `FileMaterialItem` pakai icon `<File />` untuk semua tipe

---

## Tahap Implementasi

### Tahap 1 — Backend: Hapus Constant VIDEO

**File:** `lms-usti-be/model/material.go`

Hapus `AttachmentTypeVideo AttachmentType = "VIDEO"`. Sisa:
```go
const (
    AttachmentTypeFile AttachmentType = "FILE"
    AttachmentTypeLink AttachmentType = "LINK"
)
```

**Verifikasi:** `go build ./...`

---

### Tahap 2 — Backend: Update Binding Tags

**File:** `lms-usti-be/data/attachment.go`

Ganti `binding:"required,oneof=FILE VIDEO LINK"` → `binding:"required,oneof=FILE LINK"`

**File:** `lms-usti-be/data/submission.go`

Ganti `binding:"required,oneof=FILE VIDEO LINK"` → `binding:"required,oneof=FILE LINK"`

**Verifikasi:** `go build ./...`

---

### Tahap 3 — Backend: Update Service Validation

**File:** `lms-usti-be/services/material_service.go`

Di `Create` dan `Update`:
- Hapus pengecekan `attType != model.AttachmentTypeVideo` — sisa `attType != model.AttachmentTypeFile && attType != model.AttachmentTypeLink`
- Hapus `attType == model.AttachmentTypeVideo` dari validasi `UniqueName` — sisa `attType == model.AttachmentTypeFile`

**File:** `lms-usti-be/services/assignment_service.go`

Sama seperti material service.

**Verifikasi:** `go build ./...`

---

### Tahap 4 — Backend: Migrate Data Existing

Jalankan SQL update untuk mengubah semua data `type = "VIDEO"` menjadi `type = "FILE"` di 3 tabel:

```sql
UPDATE material_attachments SET type = 'FILE' WHERE type = 'VIDEO';
UPDATE assignment_attachments SET type = 'FILE' WHERE type = 'VIDEO';
UPDATE submission_attachments SET type = 'FILE' WHERE type = 'VIDEO';
```

**Verifikasi:** Cek tidak ada data dengan `type = "VIDEO"` lagi:
```sql
SELECT COUNT(*) FROM material_attachments WHERE type = 'VIDEO';
SELECT COUNT(*) FROM assignment_attachments WHERE type = 'VIDEO';
SELECT COUNT(*) FROM submission_attachments WHERE type = 'VIDEO';
```

---

### Tahap 5 — Backend: Update Tests

**File:** `lms-usti-be/main_assignment_test.go`
**File:** `lms-usti-be/main_material_test.go`

- Hapus test case yang input `type: "VIDEO"`
- Pastikan test case `type: "FILE"` dan `type: "LINK"` tetap jalan

**Verifikasi:** `go test ./...`

---

### Tahap 6 — Frontend: Update TypeScript Types

**File:** `lms-usti-fe/src/types/Classroom.d.ts`

Ganti `type: "FILE" | "VIDEO" | "LINK"` → `type: "FILE" | "LINK"`

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 7 — Frontend: Update Zod Schemas

**File:** `lms-usti-fe/src/schemas/schemas.ts`

Ganti `z.enum(["FILE", "VIDEO", "LINK"])` → `z.enum(["FILE", "LINK"])`

**File:** `lms-usti-fe/src/schemas/material.ts`
**File:** `lms-usti-fe/src/schemas/assignment.ts`

Sama — hapus `"VIDEO"` dari enum.

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 8 — Frontend: Update Filter Logic

Ganti semua filter `a.type === "FILE" || a.type === "VIDEO"` → `a.type === "FILE"`

**File yang perlu diupdate:**
- `src/components/common/MaterialDetail/MaterialDetail.tsx`
- `src/components/common/AssignmentDetail/AssignmentDetail.tsx`
- `src/components/common/AssignmentDetail/AssignmentAttachmentSection/AssignmentAttachmentSection.tsx`
- `src/components/common/AssignmentDetail/AssignmentDetailGrading/AttachmentCard.tsx`
- `src/components/common/AssignmentDetail/SubmitAssignmentDialog/SubmitAssignmentDialog.tsx`
- `src/components/common/AssignmentDetail/SubmitAssignmentDialog/useSubmitAssignmentDialog.tsx`
- Dialog create/edit material dan assignment (jika ada filter yang sama)

**Catatan:** Setelah refactor, cukup filter `a.type === "FILE"` — tidak perlu lagi `|| a.type === "VIDEO"`.

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 9 — Frontend: Deteksi Video dari Ekstensi

Untuk kebutuhan UI (icon, buka VideoDialog vs ViewPdf), deteksi video dari ekstensi file.

**File:** `lms-usti-fe/src/lib/utils.ts`

Tambah helper:
```ts
const VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "webm", "mkv"];

export function isVideoFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.includes(ext);
}
```

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 10 — Frontend: Update FileMaterialItem

**File:** `src/components/common/MaterialDetail/FileMaterialItem/FileMaterialItem.tsx`

Ganti logic icon:
- Import `isVideoFile` dari `@/lib/utils`
- Jika `isVideoFile(fileMateri.name)` → icon `<Video />`
- Selain itu → icon `<File />`

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 11 — Frontend: Update FileAttachmentSection

**File:** `src/components/common/MaterialDetail/FileAttachmentSection/FileAttachmentSection.tsx`

Update state dan render logic:
- State `previewFile` sekarang `{ url: string; name: string; isVideo: boolean } | null`
- Saat klik: `isVideo = isVideoFile(item.name)`
- Jika `isVideo` → render `VideoDialog` (pakai `VideoModal` dari `video-dialog.tsx`)
- Jika bukan → render `ViewPdf`

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 12 — Frontend: Update AttachmentCard (Penilaian)

**File:** `src/components/common/AssignmentDetail/AssignmentDetailGrading/AttachmentCard.tsx`

Sama seperti Tahap 11:
- State `previewFile` pakai `isVideo` boolean
- Render `VideoDialog` atau `ViewPdf` berdasarkan `isVideoFile(name)`
- Icon `<Video />` atau `<File />` berdasarkan `isVideoFile(name)`

**Verifikasi:** `npx tsc --noEmit && npm run build`

---

## Ringkasan File yang Diubah

| File | Layer | Tindakan |
|------|-------|----------|
| `model/material.go` | Backend | Hapus `AttachmentTypeVideo` constant |
| `data/attachment.go` | Backend | Update binding tag `oneof=FILE LINK` |
| `data/submission.go` | Backend | Update binding tag `oneof=FILE LINK` |
| `services/material_service.go` | Backend | Hapus validasi VIDEO |
| `services/assignment_service.go` | Backend | Hapus validasi VIDEO |
| SQL migration | Backend | Update data `VIDEO` → `FILE` |
| Test files | Backend | Hapus test case VIDEO |
| `types/Classroom.d.ts` | Frontend | Hapus `"VIDEO"` dari type union |
| `schemas/schemas.ts` | Frontend | Hapus `"VIDEO"` dari enum |
| `schemas/material.ts` | Frontend | Hapus `"VIDEO"` dari enum |
| `schemas/assignment.ts` | Frontend | Hapus `"VIDEO"` dari enum |
| ~8 files dengan filter | Frontend | Ganti `FILE \|\| VIDEO` → `FILE` |
| `lib/utils.ts` | Frontend | Tambah `isVideoFile()` helper |
| `FileMaterialItem.tsx` | Frontend | Icon berdasarkan `isVideoFile()` |
| `FileAttachmentSection.tsx` | Frontend | Render VideoDialog/ViewPdf berdasarkan `isVideoFile()` |
| `AttachmentCard.tsx` | Frontend | Render VideoDialog/ViewPdf berdasarkan `isVideoFile()` |

---

## Referensi

- `model/material.go` — definisi `AttachmentType` dan constant
- `data/attachment.go` — binding tag validation
- `services/material_service.go` — validasi bisnis per tipe
- `services/assignment_service.go` — validasi bisnis per tipe
- `src/types/Classroom.d.ts` — TypeScript `IAttachment` type
- `src/components/ui/video-dialog.tsx` — komponen video dialog yang sudah ada

---

## Verifikasi

1. **Backend:** `go build ./... && go test ./...` tanpa error
2. **Frontend:** `npx tsc --noEmit && npm run build` tanpa error
3. **Database:** Tidak ada data dengan `type = "VIDEO"` lagi
4. **Test manual:**
   - Upload lampiran PDF → type = "FILE", icon `<File />`, klik buka ViewPdf
   - Upload lampiran video → type = "FILE", icon `<Video />`, klik buka VideoDialog
   - Lampiran link tetap type = "LINK"
   - Semua halaman (materi, tugas, penilaian) berfungsi normal
