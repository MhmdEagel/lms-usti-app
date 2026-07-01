# Issue: Halaman Komentar Materi (Frontend)

## Goal

Tambah tab navigasi "Detail | Komentar" di halaman detail materi. Tab "Detail" tetap di halaman yang sama. Tab "Komentar" mengarah ke route `/classroom/:id/materi/:materiId/comments`. Tab aktif ditandai berdasarkan route saat ini (pakai `usePathname()`). Berlaku untuk dosen dan mahasiswa.

---

## Kondisi Saat Ini

**Frontend:**
- `MaterialDetail.tsx` adalah flat page tanpa tab — semua konten (deskripsi, lampiran, link) ditampilkan sekaligus
- Belum ada komponen komentar, server action komentar, atau service komentar di frontend
- `ContentEditor` sudah ada — digunakan di pengumuman dan form materi
- Pattern server action sudah ada di `src/actions/` (contoh: `new-announcement.ts`)

**Backend:**
- Endpoint komentar sudah jalan: `GET/POST/DELETE /classroom/:id/materials/:materialId/comments`
- Belum ada service komentar di frontend (`comment.service.ts`)

---

## Tahap Implementasi

### Tahap 1 — Tambah Comment Service Frontend

**File:** `src/services/comment.service.ts` (baru)

Buat service dengan methods:
- `getComments(classroomId: string, materialId: string)` — GET `/classroom/:id/materials/:materialId/comments`
- `createComment(classroomId: string, materialId: string, payload: { content: string })` — POST
- `deleteComment(classroomId: string, materialId: string, commentId: string)` — DELETE

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 2 — Tambah Comment Types

**File:** `src/types/Classroom.d.ts`

Tambah interfaces:
```ts
interface IComment {
  id: string;
  content: string;
  created_by: string;
  user: { fullname: string; profile: string };
  created_at: string;
}
```

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 3 — Buat Server Actions

**File:** `src/actions/get-comments.ts` (baru)

Server action yang wrap `commentServices.getComments()`. Return `{ data: IComment[] | null, error: string | null }`.

**File:** `src/actions/create-comment.ts` (baru)

Server action yang wrap `commentServices.createComment()`. Panggil `revalidatePath` setelah berhasil.

**File:** `src/actions/delete-comment.ts` (baru)

Server action yang wrap `commentServices.deleteComment()`. Panggil `revalidatePath` setelah berhasil.

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 4 — Buat Page Route Komentar

**File:** `src/app/dosen/kelas/[classroomId]/materi/[materiId]/comments/page.tsx` (baru)

Page server component:
1. Ambil `classroomId` dan `materiId` dari params
2. Ambil user via `getCurrentUser()`
3. Render tab navigasi "Detail | Komentar" — tab "Komentar" aktif (link ke halaman ini)
4. Render `<CommentSection>` di dalam Suspense + skeleton

**File:** `src/app/mahasiswa/kelas/[classroomId]/materi/[materiId]/comments/page.tsx` (baru)

Sama seperti versi dosen, tapi role = MAHASISWA.

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 5 — Buat MaterialTabNavigation Component

**File:** `src/components/common/MaterialDetail/MaterialTabNavigation.tsx` (baru)

Component client (karena pakai `usePathname()`) yang:
1. Terima props `classroomId`, `materialId`, `role`
2. Tentukan tab aktif berdasarkan `usePathname()` — jika path mengandung `/comments` maka "Komentar" aktif, selain itu "Detail" aktif
3. Render dua tab:
   - Tab "Detail" → Link ke `/${role}/kelas/${classroomId}/materi/${materiId}`
   - Tab "Komentar" → Link ke `/${role}/kelas/${classroomId}/materi/${materiId}/comments`
4. Tab aktif ditandai dengan style yang berbeda (underline/bold/background)
5. Style konsisten dengan `AssignmentDetailTabNavbar`

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 6 — Buat CommentSection Component

**File:** `src/components/common/MaterialDetail/CommentSection/CommentSection.tsx` (baru)

Component client yang:
1. Terima props `classroomId`, `materialId`, `user` (object { userId, fullname, profile })
2. Fetch komentar via `getComments()` server action (useEffect)
3. Render input area:
   - Avatar user di kiri atas
   - ContentEditor di tengah (placeholder "Tulis komentar...")
   - Tombol "Posting" di kanan bawah
4. Render list komentar di bawah input
5. Handle submit: panggil `createComment()`, refresh list
6. Handle delete: panggil `deleteComment()` (hanya untuk komentar sendiri atau DOSEN)

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 7 — Buat CommentItem Component

**File:** `src/components/common/MaterialDetail/CommentSection/CommentItem.tsx` (baru)

Component yang render satu komentar:
- Avatar + fullname + waktu (relative, pakai dayjs)
- Konten komentar (HTML via dangerouslySetInnerHTML + DOMPurify)
- Tombol hapus (hanya tampil untuk pemilik komentar atau DOSEN)

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 8 — Buat CommentSection Skeleton

**File:** `src/components/common/MaterialDetail/CommentSection/CommentSectionSkeleton.tsx` (baru)

Skeleton loading state untuk comment section:
- Placeholder input area
- 3-4 placeholder komentar (avatar + baris teks)

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 9 — Tambah Tab Navigasi di MaterialDetail

**File:** `src/components/common/MaterialDetail/MaterialDetail.tsx`

Di bagian atas konten (setelah breadcrumbs), render `<MaterialTabNavigation>`:
- Props: `classroomId`, `materiId`, `role`

**Verifikasi:** `npx tsc --noEmit && npm run build`

---

## Ringkasan File yang Diubah

| File | Layer | Tindakan |
|------|-------|----------|
| `src/services/comment.service.ts` | Service | Baru — getComments, createComment, deleteComment |
| `src/types/Classroom.d.ts` | Types | Tambah IComment interface |
| `src/actions/get-comments.ts` | Server Action | Baru |
| `src/actions/create-comment.ts` | Server Action | Baru |
| `src/actions/delete-comment.ts` | Server Action | Baru |
| `app/dosen/.../comments/page.tsx` | Page Route | Baru |
| `app/mahasiswa/.../comments/page.tsx` | Page Route | Baru |
| `MaterialTabNavigation.tsx` | Component | Baru — tab navigasi "Detail \| Komentar" |
| `CommentSection.tsx` | Component | Baru — input + list komentar |
| `CommentItem.tsx` | Component | Baru — render satu komentar |
| `CommentSectionSkeleton.tsx` | Component | Baru — loading skeleton |
| `MaterialDetail.tsx` | Component | Render `<MaterialTabNavigation>` |

---

## Referensi

- `ContentEditor`: `src/components/ui/content-editor.tsx` — Lexical rich text editor
- `AddAnnouncement`: pola ContentEditor + form submit
- Backend routes: `GET/POST/DELETE /classroom/:id/materials/:materialId/comments`
- Server action pattern: `src/actions/new-announcement.ts`
- Route structure: `app/dosen/kelas/[classroomId]/materi/[materiId]/page.tsx`
- `usePathname()`: Next.js hook untuk tentukan tab aktif

---

## Verifikasi

1. **Frontend:** `npx tsc --noEmit && npm run build` tanpa error
2. **Test manual:**
   - Login dosen/mahasiswa → buka kelas → buka materi
   - Tab "Detail" aktif, menampilkan konten materi yang sudah ada
   - Klik tab "Komentar" → navigasi ke halaman `/comments`
   - Tab "Komentar" aktif di halaman comments
   - Avatar user tampil di sebelah kiri input
   - Ketik komentar → klik "Posting" → komentar muncul di list
   - Hapus komentar (pemilik atau DOSEN) → komentar terhapus
   - Loading skeleton muncul saat fetch komentar
   - Klik tab "Detail" → kembali ke halaman detail materi
