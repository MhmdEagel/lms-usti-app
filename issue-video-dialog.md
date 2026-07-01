# Issue: Video Dialog untuk Lampiran Tipe Video

## Goal

Saat user mengklik lampiran bertipe `VIDEO`, tampilkan video player pakai komponen `VideoDialog` yang sudah ada (`src/components/ui/video-dialog.tsx`). Berlaku untuk halaman detail materi, detail tugas, dan halaman penilaian.

---

## Kondisi Saat Ini

**Masalah:**
- Lampiran `VIDEO` dan `FILE` diperlakukan sama — keduanya dibuka pakai `ViewPdf` (PDF viewer)
- Video yang diklik akan error "Gagal memuat PDF" karena bukan file PDF

**Komponen yang terdampak:**
- `FileAttachmentSection` — digunakan di `MaterialDetail` dan `AssignmentDetail`
- `AttachmentCard` — digunakan di halaman penilaian (`AssignmentDetailGrading`)
- Ketiganya filter `a.type === "FILE" || a.type === "VIDEO"` lalu buka `ViewPdf`

**Komponen yang sudah ada:**
- `src/components/ui/video-dialog.tsx` — Radix Dialog + video player (exports: `VideoModal`, `VideoModalContent`, `VideoModalVideo`, `VideoPlayer`, `VideoPreview`, `VideoPlayButton`)

---

## Tahap Implementasi

### Tahap 1 — Update FileAttachmentSection

**File:** `src/components/common/MaterialDetail/FileAttachmentSection/FileAttachmentSection.tsx`

Saat ini: semua attachment buka `ViewPdf`.

Perubahan:
1. Import `VideoModal`, `VideoModalContent`, `VideoModalVideo` dari `@/components/ui/video-dialog`
2. State `previewFile` bertipe `{ url: string; name: string; type: "FILE" | "VIDEO" } | null`
3. Saat klik attachment:
   - Jika `type === "VIDEO"` → set state dengan tipe "VIDEO"
   - Jika `type === "FILE"` → set state dengan tipe "FILE"
4. Render kondisional:
   - Jika state tipe "VIDEO" → render `<VideoModal open onOpenChange={...}><VideoModalContent><VideoModalVideo><video src={url} controls /></VideoModalVideo></VideoModalContent></VideoModal>`
   - Jika state tipe "FILE" → render `<ViewPdf>` (sama seperti sekarang)

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 2 — Update AttachmentCard (Halaman Penilaian)

**File:** `src/components/common/AssignmentDetail/AssignmentDetailGrading/AttachmentCard.tsx`

Saat ini: semua file attachment buka `ViewPdf`.

Perubahan:
1. Import `VideoModal`, `VideoModalContent`, `VideoModalVideo` dari `@/components/ui/video-dialog`
2. State `previewFile` bertipe `{ url: string; name: string; type: "FILE" | "VIDEO" } | null`
3. Saat klik attachment:
   - Jika `type === "VIDEO"` → set state dengan tipe "VIDEO"
   - Jika `type === "FILE"` → set state dengan tipe "FILE"
4. Render kondisional:
   - Jika state tipe "VIDEO" → render `VideoModal` + `VideoModalContent` + `VideoModalVideo` dengan `<video>` element
   - Jika state tipe "FILE" → render `<ViewPdf>`

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 3 — Update Icon per Tipe

**File:** `src/components/common/MaterialDetail/FileMaterialItem/FileMaterialItem.tsx`

Saat ini: semua attachment pakai icon `<File />`.

Perubahan:
- Jika `type === "VIDEO"` → pakai icon `<Video />` (dari lucide-react)
- Jika `type === "FILE"` → tetap pakai `<File />`

**File:** `src/components/common/AssignmentDetail/AssignmentDetailGrading/AttachmentCard.tsx`

Saat render file attachment card:
- Jika `type === "VIDEO"` → pakai icon `<Video />`
- Jika `type === "FILE"` → tetap pakai `<File />`

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 4 — Pastikan AssignmentAttachmentSection Turun Perubahan

**File:** `src/components/common/AssignmentDetail/AssignmentAttachmentSection/AssignmentAttachmentSection.tsx`

Komponen ini reuse `FileAttachmentSection`. Perubahan di Tahap 1 otomatis berlaku untuk AssignmentDetail juga.

**Verifikasi:** `npx tsc --noEmit && npm run build`

---

## Ringkasan File yang Diubah

| File | Layer | Tindakan |
|------|-------|----------|
| `FileAttachmentSection.tsx` | Component | Update — bedakan FILE vs VIDEO, render VideoDialog |
| `AttachmentCard.tsx` | Component | Update — bedakan FILE vs VIDEO, render VideoDialog |
| `FileMaterialItem.tsx` | Component | Update — icon `<Video />` untuk tipe VIDEO |

---

## Referensi

- `src/components/ui/video-dialog.tsx` — komponen yang sudah ada (VideoModal, VideoModalContent, VideoModalVideo)
- `ViewPdf/ViewPdf.tsx` — PDF viewer (tetap dipakai untuk FILE)
- `FileAttachmentSection.tsx` — tempat render file cards + preview
- `AttachmentCard.tsx` — tempat render file cards di halaman penilaian
- `FileMaterialItem.tsx` — card individual lampiran
- `IAttachment.type` — `"FILE" | "VIDEO" | "LINK"`

---

## Verifikasi

1. **Frontend:** `npx tsc --noEmit && npm run build` tanpa error
2. **Test manual:**
   - Buka materi yang punya lampiran video → klik video → VideoDialog muncul, video bisa diputar
   - Buka materi yang punya lampiran PDF → klik PDF → ViewPdf muncul (sama seperti sekarang)
   - Buka tugas yang punya lampiran video → klik video → VideoDialog muncul
   - Buka halaman penilaian → klik lampiran video mahasiswa → VideoDialog muncul
   - Icon lampiran VIDEO tampil sebagai `<Video />`, FILE tetap `<File />`
