# Issue: Perbaikan Bug & Error Handling — Media API Backend

## Goal

Memperbaiki bug dan masalah error handling pada fitur media API (upload, delete, find) backend. Instruksi high-level untuk junior programmer / AI model murah.

---

## Tahapan

### Tahap 1 — Fix `UploadProfilePicture`: Tidak Save File ke Disk

**File:** `lms-usti-be/controllers/media_controller.go` (line 123-146)

**Bug:** `UploadMaterial` dan `UploadAssignment` memanggil `ctx.SaveUploadedFile()`, tapi `UploadProfilePicture` tidak. File tidak pernah tersimpan ke disk meskipun response sukses.

**Fix:** Tambahkan `ctx.SaveUploadedFile(uploadData.File, uploadData.UploadPath)` setelah error check `mediaService.Upload()`, sebelum membuat response. Tiru pola dari `UploadMaterial` (line 82).

---

### Tahap 2 — Fix Response Message yang Salah

**File:** `lms-usti-be/controllers/media_controller.go`

**Bug 1 (line 168):** `RemoveAssignment` mengirim `"material successfully removed"` — harusnya `"assignment berhasil dihapus"`.

**Bug 2 (line 216):** `RemoveAssignmentBatch` mengirim `"successfully delete materials in batch"` — harusnya `"berhasil menghapus assignment secara batch"`.

**Bug 3 (line 192):** `RemoveMaterialBatch` grammar salah: `"delete"` harusnya `"deleted"`. Ganti ke `"berhasil menghapus material secara batch"`.

**Fix:** Ganti semua message ke Bahasa Indonesia yang konsisten:
- `RemoveMaterial`: `"material berhasil dihapus"`
- `RemoveAssignment`: `"assignment berhasil dihapus"`
- `RemoveMaterialBatch`: `"berhasil menghapus material secara batch"`
- `RemoveAssignmentBatch`: `"berhasil menghapus assignment secara batch"`
- `RemoveProfilePicture`: `"profile picture berhasil dihapus"`

---

### Tahap 3 — Fix Error Message Leak ke Client

**File:** `lms-usti-be/controllers/media_controller.go`

**Bug:** Semua error handler menampilkan `err.Error()` langsung ke client. Bisa membocorkan path server dan detail error internal.

**Lokasi yang perlu diubah:** line 71, 78, 102, 108, 131, 139, 152, 164, 183, 206, 224

**Fix:** Untuk setiap error handler:
1. Tambah `log.Printf()` untuk log error di server
2. Ganti message ke generic: `"terjadi kesalahan server"` untuk 500, `"invalid request"` untuk 400

**Pattern yang sudah ada:** Lihat `controllers/auth_controller.go:22-33` — function `handleError()`.

**Catatan:** Jika ingin konsisten dengan auth controller, bisa refactor media controller untuk pakai `handleError()` juga. Tapi untuk perbaikan cepat, cukup ganti `err.Error()` dengan message generic.

---

### Tahap 4 — Tambah Validasi File Size di Upload

**File:** `lms-usti-be/services/media_service.go` (line 35-45)

**Bug:** `lib.ValidateFile()` sudah ada (utils.go:63-82) dan bisa cek file size, tapi tidak pernah dipanggil di `MediaService.Upload()`. File besar bisa di-upload tanpa batas.

**Fix:** Tambahkan `lib.ValidateFile(req.File)` di awal function `Upload()`, sebelum `lib.DetectFileType()`. Jika error, return error.

```go
func (m *MediaService) Upload(req data.MediaSingleRequest, kind MediaKind) (data.MediaUpload, error) {
    if err := lib.ValidateFile(req.File); err != nil {
        return data.MediaUpload{}, err
    }
    // ... existing code
}
```

**Catatan:** Pastikan `env.MAX_FILE_SIZE` sudah di-set di `.env`. Jika kosong, `ParseSize` return 0 dan semua file akan ditolak.

---

### Tahap 5 — Hapus `fmt.Println` Debug Statement

**File:** `lms-usti-be/services/media_service.go` (line 51)

**Bug:** `fmt.Println(fullPath)` — debug print yang tertinggal.

**Fix:** Hapus baris tersebut. Jika perlu logging, gunakan `log.Printf("Remove: %s", fullPath)`.

---

### Tahap 6 — Fix Path Traversal Check

**File:** `lms-usti-be/services/media_service.go`

**Bug:** `strings.HasPrefix(fullPath, root)` bisa bypass. Contoh: root=`/storage/materials`, fullPath=`/storage/materials-other/evil.txt` — prefix sama tapi path berbeda.

**Lokasi:** `Remove` (line 53) dan `RemoveBatch` (line 70)

**Fix:** Tambah separator di akhir root saat comparison:
```go
if !strings.HasPrefix(filepath.Clean(fullPath), filepath.Clean(root)+string(filepath.Separator)) {
    return errors.New("Invalid file path")
}
```

---

### Tahap 7 — Tambah Image Types ke `GetUploadConfig`

**File:** `lms-usti-be/lib/uploads.go` (line 27-29)

**Bug:** `AllowedTypes` hanya punya `FileTypeDocument`. `FileTypeImage` tidak ada. Jika `ValidateFile` diaktifkan (Tahap 4), semua image file akan ditolak.

**Fix:** Tambahkan `FileTypeImage` ke `allowedTypes`:
```go
allowedTypes := map[FileType][]string{
    FileTypeDocument: strings.Split("pdf,doc,docx,txt", ","),
    FileTypeImage:    strings.Split("jpg,jpeg,png,gif,webp", ","),
}
```

---

### Tahap 8 — Hapus Dead Code `MediaMultipleRequest`

**File:** `lms-usti-be/data/media.go` (line 8-11)

**Bug:** `MediaMultipleRequest` tidak digunakan di mana pun.

**Fix:** Hapus struct `MediaMultipleRequest`.

---

## Urutan Pengerjaan

| Tahap | File | Prioritas | Dependensi |
|-------|------|-----------|------------|
| 1 | `controllers/media_controller.go` | Critical | — |
| 2 | `controllers/media_controller.go` | Critical | — |
| 3 | `controllers/media_controller.go` | High | — |
| 4 | `services/media_service.go` | High | Tahap 7 |
| 5 | `services/media_service.go` | Medium | — |
| 6 | `services/media_service.go` | Medium | — |
| 7 | `lib/uploads.go` | Medium | — |
| 8 | `data/media.go` | Low | — |

**Tips:** Tahap 1, 2, 3 bisa dikerjakan bersama karena file yang sama (`controllers/media_controller.go`). Tahap 4 harus setelah Tahap 7. Tahap 5, 6, 8 independent.

---

## File yang Terlibat

| File | Aksi |
|------|------|
| `lms-usti-be/controllers/media_controller.go` | Edit — fix save file, fix messages, fix error leak |
| `lms-usti-be/services/media_service.go` | Edit — tambah validasi, hapus debug, fix path traversal |
| `lms-usti-be/lib/uploads.go` | Edit — tambah image types |
| `lms-usti-be/data/media.go` | Edit — hapus dead code |

---

## Referensi

- Pola `handleError()`: `controllers/auth_controller.go:22-33`
- Pola `ctx.SaveUploadedFile()`: `controllers/media_controller.go:82` (UploadMaterial)
- Pola validasi file: `lib/utils.go:63-82` (ValidateFile)
- Pola allowed types: `lib/uploads.go:27-29`
