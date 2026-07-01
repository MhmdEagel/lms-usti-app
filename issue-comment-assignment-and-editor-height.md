# Issue: Halaman Komentar Tugas + Update ContentEditor Height

## Goal

1. Tambah tab navigasi "Detail | Komentar" di halaman detail tugas (dosen & mahasiswa), mengarah ke route `/comments` — pola sama seperti materi.
2. Update `min-h` ContentEditor di halaman komentar materi dan tugas menjadi `min-h-[100px]`.

---

## Kondisi Saat Ini

**Frontend — Materi (sudah ada):**
- `MaterialTabNavigation.tsx` — tab "Materi | Komentar" dengan route-based navigation
- `Comment/` directory — `CommentSection`, `CommentItem`, `CommentSectionData`, `CommentSectionWrapper`, `CommentSectionSkeleton`
- `app/dosen/.../materi/[materiId]/comments/page.tsx` dan versi mahasiswa — sudah jalan
- `comment.service.ts` — getComments, createComment, deleteComment (hanya untuk materials)
- ContentEditor di `CommentSection.tsx` saat ini pakai `min-h-[200px]`

**Frontend — Tugas (belum ada):**
- `AssignmentDetailTabNavbar.tsx` — tab "Detail | Penilaian" (dosen saja, belum ada tab Komentar)
- `AssignmentDetail.tsx` — flat page tanpa tab komentar
- Belum ada page route `/comments` untuk tugas
- Belum ada comment service untuk assignments

**Backend:**
- Endpoint assignment comments sudah jalan: `GET/POST/DELETE /classroom/:id/assignments/:assignmentId/comments`
- `comment.service.ts` di backend sudah handle `commentable_type: ASSIGNMENT`
- Tidak perlu perubahan backend

---

## Tahap Implementasi

### Tahap 1 — Extend Comment Service Frontend untuk Assignments

**File:** `src/services/comment.service.ts`

Tambah methods baru (atau extend yang sudah ada):
- `getAssignmentComments(classroomId: string, assignmentId: string)` — GET `/classroom/:id/assignments/:assignmentId/comments`
- `createAssignmentComment(classroomId: string, assignmentId: string, payload: { content: string })` — POST
- `deleteAssignmentComment(classroomId: string, assignmentId: string, commentId: string)` — DELETE

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 2 — Extend Server Actions untuk Assignment Comments

**File:** `src/actions/create-comment.ts`

Extend `createComment()` agar support assignment — tambah parameter `type: "material" | "assignment"`. Saat type = "assignment", panggil `commentServices.createAssignmentComment()`.

**File:** `src/actions/delete-comment.ts`

Extend `deleteComment()` — tambah parameter `type`. Saat type = "assignment", panggil `commentServices.deleteAssignmentComment()`.

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 3 — Buat Assignment Comment Page Routes

**File:** `src/app/dosen/kelas/[classroomId]/tugas/[assignmentId]/comments/page.tsx` (baru)

Page server component — pola sama dengan materi comments page:
1. Ambil `classroomId` dan `assignmentId` dari params
2. Ambil user via `getCurrentUser()`
3. Fetch assignment data untuk nama kelas & judul tugas
4. Render tab navigasi (AssignmentTabNavigation) — tab "Komentar" aktif
5. Render `<CommentSectionData>` di dalam Suspense + skeleton

**File:** `src/app/mahasiswa/kelas/[classroomId]/tugas/[assignmentId]/comments/page.tsx` (baru)

Sama seperti versi dosen, tapi role = MAHASISWA.

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 4 — Buat AssignmentTabNavigation Component

**File:** `src/components/common/AssignmentDetail/AssignmentTabNavigation.tsx` (baru)

Component client — pola sama dengan `MaterialTabNavigation`:
1. Ambil pathname, params dari `usePathname()`, `useParams()`
2. Tentukan tab aktif berdasarkan route — jika path mengandung `/comments` maka "Komentar" aktif, jika mengandung `/penilaian` maka "Penilaian" aktif, selain itu "Detail" aktif
3. Render tabs:
   - "Detail" → `/${type}/kelas/${classroomId}/tugas/${assignmentId}`
   - "Komentar" → `/${type}/kelas/${classroomId}/tugas/${assignmentId}/comments`
   - "Penilaian" → hanya tampil untuk dosen: `/${type}/kelas/${classroomId}/tugas/${assignmentId}/penilaian`
4. Style konsisten dengan `MaterialTabNavigation` (border-b, icon, active state)

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 5 — Buat Assignment Comment Components

**File:** `src/components/common/AssignmentDetail/Comment/` (directory baru)

Komponen dengan pola sama seperti `MaterialDetail/Comment/`:
- `CommentSectionData.tsx` — server component, fetch data via `commentServices.getAssignmentComments()`
- `CommentSectionWrapper.tsx` — dynamic import wrapper
- `CommentSection.tsx` — client component, render input + list komentar
- `CommentItem.tsx` — render satu komentar (avatar, nama, waktu, konten, tombol hapus)
- `CommentSectionSkeleton.tsx` — loading skeleton

Bisa juga refactor shared components dari `MaterialDetail/Comment/` agar reusable, tapi untuk kesederhanaan, buat copy dulu — bisa di-refactor nanti.

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 6 — Update AssignmentDetailTabNavbar

**File:** `src/components/common/AssignmentDetail/AssignmentDetailTabNavbar/AssignmentDetailTabNavbar.tsx`

Saat ini tab navbar hanya tampil untuk dosen (`type === "dosen"` di `AssignmentDetail.tsx`). Perubahan:
1. Tambah tab "Komentar" ke dalam tab list
2. Tampilkan tab navbar untuk **dosen dan mahasiswa** (hapus kondisi `type === "dosen"` di `AssignmentDetail.tsx`)
3. Untuk mahasiswa, tab "Penilaian" tidak ditampilkan

**File:** `src/components/common/AssignmentDetail/AssignmentDetail.tsx`

Hapus kondisi `{type === "dosen" && (` di sekitar `AssignmentDetailTabNavbar` — tampilkan untuk semua role.

**Verifikasi:** `npx tsc --noEmit && npm run build`

---

### Tahap 7 — Update ContentEditor min-h

**File:** `src/components/common/MaterialDetail/Comment/CommentSection.tsx`

Ganti `className="min-h-[200px]"` → `className="min-h-[100px]"`

**File:** `src/components/common/AssignmentDetail/Comment/CommentSection.tsx` (yang baru dibuat di Tahap 5)

Gunakan `className="min-h-[100px]"` untuk ContentEditor.

**Verifikasi:** `npx tsc --noEmit && npm run build`

---

## Ringkasan File yang Diubah

| File | Layer | Tindakan |
|------|-------|----------|
| `src/services/comment.service.ts` | Service | Extend — tambah methods untuk assignment |
| `src/actions/create-comment.ts` | Server Action | Extend — tambah param `type` |
| `src/actions/delete-comment.ts` | Server Action | Extend — tambah param `type` |
| `app/dosen/.../tugas/[assignmentId]/comments/page.tsx` | Page Route | Baru |
| `app/mahasiswa/.../tugas/[assignmentId]/comments/page.tsx` | Page Route | Baru |
| `AssignmentDetail/AssignmentTabNavigation.tsx` | Component | Baru — tab navigasi untuk tugas |
| `AssignmentDetail/Comment/*.tsx` | Component | Baru — comment section untuk tugas |
| `AssignmentDetail/AssignmentDetailTabNavbar.tsx` | Component | Update — tambah tab Komentar |
| `AssignmentDetail/AssignmentDetail.tsx` | Component | Update — tampilkan tab navbar untuk semua role |
| `MaterialDetail/Comment/CommentSection.tsx` | Component | Update — ContentEditor min-h → 100px |

---

## Referensi

- `MaterialTabNavigation.tsx` — pola tab navigasi route-based
- `MaterialDetail/Comment/` — pola comment section
- `app/dosen/.../materi/[materiId]/comments/page.tsx` — pola page route komentar
- `AssignmentDetailTabNavbar.tsx` — tab navbar tugas yang sudah ada
- Backend routes: `GET/POST/DELETE /classroom/:id/assignments/:assignmentId/comments`

---

## Verifikasi

1. **Frontend:** `npx tsc --noEmit && npm run build` tanpa error
2. **Test manual:**
   - Login dosen → buka kelas → buka tugas → tab "Detail | Komentar | Penilaian" tampil
   - Klik tab "Komentar" → navigasi ke halaman `/comments`
   - Input komentar + list komentar tampil
   - Klik tab "Detail" → kembali ke detail tugas
   - Klik tab "Penilaian" → ke halaman penilaian
   - Login mahasiswa → buka tugas → tab "Detail | Komentar" tampil (tanpa "Penilaian")
   - ContentEditor di komentar materi dan tugas memiliki tinggi minimal 100px
