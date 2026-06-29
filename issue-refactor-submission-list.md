# Issue: Refactoring List Submissions — Pindah Search ke Card & Filter ke Backend

## Goal

Refactoring tampilan list submissions pada halaman penilaian:
1. Pindahkan SearchBar ke dalam `SubmissionListCard`
2. Pindahkan logic filtering (semua, telat, belum dinilai, sudah mengirim, belum mengirim) dari frontend ke backend

---

## Kondisi Saat Ini

**Backend:**
- `SubmissionRepository.FindAllByAssignmentId` — sudah support `search` param (LIKE fullname)
- Belum ada support untuk filter (telat, belum_dinilai, sudah_mengirim, belum_mengirim)
- Pagination sudah jalan

**Frontend:**
- `GradingContent.tsx` — SearchBar ditempatkan DI LUAR card (baris 67)
- `SubmissionListCard.tsx` — filtering dilakukan di frontend pakai `useMemo` (client-side)
- `SubmissionListCard.tsx` — area search di dalam card kosong (baris 107-109)

---

## Backend: Tahap Implementasi

### Tahap 1 — Tambah Filter di Repository

**File:** `repositories/submission_repository.go`

Ubah method `FindAllByAssignmentId` — tambahkan parameter `filter string`, lalu bangun query filter di backend berdasarkan value filter:

| Filter | Query Logic |
|--------|-------------|
| `semua` | Tidak ada filter tambahan |
| `belum_mengirim` | Return kosong (tidak ada submission) |
| `sudah_mengirim` | `status = 'submitted'` |
| `belum_dinilai` | `status = 'submitted' AND score IS NULL` |
| `telat` | `submission_date > assignment.deadline` (perlu join ke assignment) |

Untuk filter `telat`, perlu join ke table `assignments` untuk ambil `deadline`, lalu bandingkan dengan `submission_date`.

Update interface `SubmissionRepositoryInterface` — tambahkan parameter `filter string`.

**Verifikasi:** `go build ./...`

---

### Tahap 2 — Update Service

**File:** `services/submission_service.go`

Ubah method `FindAll` — tambahkan parameter `filter string`, teruskan ke repository.

Update interface `SubmissionServiceInterface` — tambahkan parameter `filter string`.

**Verifikasi:** `go build ./...`

---

### Tahap 3 — Update Controller

**File:** `controllers/submission_controller.go`

Ubah method `FindAll` — baca query param `filter` dari request, kirim ke service.

**Verifikasi:** `go build ./...`

---

## Frontend: Tahap Implementasi

### Tahap 4 — Update Service Frontend

**File:** `src/services/assignment.service.ts`

Tambah params `filter` ke `findSubmissions`:

```ts
findSubmissions: (classroomId: string, assignmentId: string, params?: { page?: number; limit?: number; search?: string; filter?: string }) =>
  instance.get(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}/submissions`, { params }),
```

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 5 — Update Route Page

**File:** `src/app/dosen/kelas/[classroomId]/tugas/[assignmentId]/(detail-tugas)/penilaian/page.tsx`

Baca `searchParams` untuk `search` dan `filter`, pass ke component:

```tsx
const sp = await searchParams;
const page = sp.page ? parseInt(sp.page) : 1;
const limit = sp.limit ? parseInt(sp.limit) : 10;
const search = sp.search || "";
const filter = sp.filter || "semua";
```

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 6 — Update GradingContent

**File:** `AssignmentDetailGrading/GradingContent.tsx`

1. Hapus SearchBar dari `GradingContent` (baris 67)
2. Pass `search` dan `filter` ke `AssignmentDetailGrading` → `SubmissionListCard`

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 7 — Update SubmissionListCard

**File:** `AssignmentDetailGrading/SubmissionListCard.tsx`

1. Tambah SearchBar di dalam card (di bawah "Cari Mahasiswa")
2. Hapus `useMemo` filtering — gunakan data dari BE langsung
3. Filter chips tetap di card, tapi trigger perubahan URL search params (`filter`)
4. Gunakan `useRouter` + `useSearchParams` untuk update URL params saat filter berubah
5. Reset page ke 1 saat filter berubah

**Verifikasi:** `npx tsc --noEmit && npm run build`

---

## Ringkasan File yang Diubah

| File | Layer | Tindakan |
|------|-------|----------|
| `repositories/submission_repository.go` | Backend | Tambah `filter` param + query logic |
| `services/submission_service.go` | Backend | Tambah `filter` param |
| `controllers/submission_controller.go` | Backend | Baca `filter` dari query param |
| `src/services/assignment.service.ts` | Frontend | Tambah params `filter` |
| `penilaian/page.tsx` | Frontend | Baca `searchParams` untuk `search`/`filter` |
| `GradingContent.tsx` | Frontend | Hapus SearchBar, pass search/filter ke child |
| `SubmissionListCard.tsx` | Frontend | Tambah SearchBar, hapus client-side filter, trigger URL params |

---

## Referensi

- SearchBar component: `src/components/ui/searchfield.tsx` — gunakan `useDebounce` hook
- Pola filter classroom: `repositories/classroom_repository.go:54-86` — `ClassroomFilter` struct
- `data.Pagination`: `data/response.go:43-48`
- `NewPaginationResponse`: `data/response.go:32-41`
- Filter chips pattern: `SubmissionListCard.tsx` (sudah ada, pindah logic ke BE)

---

## Verifikasi

1. **Backend:** `go build ./...` tanpa error
2. **Frontend:** `npx tsc --noEmit && npm run build` tanpa error
3. **Test manual:**
   - Login dosen → buka tugas → tab Penilaian
   - Search mahasiswa → result filter dari backend
   - Klik filter chips (Semua, Telat, Belum dinilai, Sudah mengirim, Belum mengirim) → list update dari backend
   - Pagination tetap jalan dengan benar
   - Filter + search + pagination bisa dikombinasikan
