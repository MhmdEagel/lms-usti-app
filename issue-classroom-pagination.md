# Issue: Tambahkan Paginasi pada List Classroom

## Goal

Tambahkan paginasi pada halaman list classroom di dashboard dosen dan mahasiswa, mengikuti pola yang sama dengan list materi dan list tugas. Backend sudah mendukung pagination — tinggal update frontend untuk meneruskan params dan merender komponen pagination.

---

## Kondisi Saat Ini

| Aspek | Status |
|-------|--------|
| Backend controller | Sudah baca `page` + `limit` dari query params |
| Backend repository | Sudah pakai `lib.Paginate()` scope |
| Backend response | Sudah return `PaginationResponse` dengan `pagination` object |
| Frontend service | **Belum kirim** `page` + `limit` params |
| Frontend `ClassroomList` (dosen) | **Belum extract** `page`/`limit` dari searchParams, **belum render** pagination |
| Frontend `ClassroomList` (mahasiswa) | Sama — **belum ada** pagination |
| Frontend pages (dosen/mahasiswa) | **Belum extract** `page`/`limit` dari searchParams |
| Komponen `PaginationControls` | Sudah ada — reusable |
| Komponen `PaginationNav` | Sudah ada — reusable |
| Type `PaginationInfo` | Sudah ada — global declaration |

---

## Tahap 1 — Frontend: Update Service Layer

**File:** `src/services/classroom.service.ts`

- Tambah param `page?: number` dan `limit?: number` ke `findAllDosenClassrooms` dan `findAllMahasiswaClassrooms`
- Kirim bersama params lainnya: `{ search, prodi, term, tahun_ajaran, room_number, page, limit }`

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 2 — Frontend: Update Page Routes

**File:** `src/app/dosen/kelas/page.tsx`

- Extract `page` dan `limit` dari `searchParams` (ikuti pola dari page tugas/materi)
- Default: `page = 1`, `limit = 10`
- Kirim ke `<Classroom searchParams={search} page={page} limit={limit} />`

**File:** `src/app/mahasiswa/kelas/page.tsx`

- Pola sama — extract `page` + `limit`, kirim ke `<Classroom>`

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 3 — Frontend: Update Dosen Classroom

**File:** `src/components/views/Dashboard/DashboardDosen/Classroom/Classroom.tsx`

- Terima `page` dan `limit` sebagai props
- Kirim ke `<ClassroomList>` bersama `searchParams`

**File:** `src/components/views/Dashboard/DashboardDosen/Classroom/ClassroomList/ClassroomList.tsx`

- Terima `page` dan `limit` sebagai props
- Kirim ke `findAllDosenClassrooms({ ..., page, limit })`
- Extract `pagination` dari response: `res.data?.pagination`
- Render `PaginationControls` dan `PaginationNav` di bawah grid classroom (ikuti pola dari `Assignment.tsx`)

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 4 — Frontend: Update Mahasiswa Classroom

**File:** `src/components/views/Dashboard/DashboardStudent/Classroom/Classroom.tsx`

- Terima `page` dan `limit` sebagai props
- Kirim ke inline `ClassroomList` bersama `searchParams`
- Baca `pagination` dari response
- Render `PaginationControls` dan `PaginationNav` di bawah grid classroom

**Checkpoint:** `npx tsc --noEmit && npm run build`

---

## File yang Terlibat

| File | Tindakan |
|------|----------|
| `src/services/classroom.service.ts` | Update — tambah `page` + `limit` params |
| `src/app/dosen/kelas/page.tsx` | Update — extract `page` + `limit` dari searchParams |
| `src/app/mahasiswa/kelas/page.tsx` | Update — extract `page` + `limit` dari searchParams |
| `src/components/.../DashboardDosen/Classroom/Classroom.tsx` | Update — terima + forward `page`/`limit` props |
| `src/components/.../DashboardDosen/Classroom/ClassroomList/ClassroomList.tsx` | Update — kirim ke API + render PaginationControls/PaginationNav |
| `src/components/.../DashboardStudent/Classroom/Classroom.tsx` | Update — terima `page`/`limit` + render pagination |

---

## Referensi

- Pola pagination materi: `src/components/views/Dashboard/DashboardDosen/Classroom/Material/Material.tsx`
- Pola pagination tugas: `src/components/views/Dashboard/DashboardDosen/Classroom/Assignment/Assignment.tsx`
- Page route tugas (extract searchParams): `src/app/dosen/kelas/[classroomId]/(detail-kelas)/tugas/page.tsx`
- Komponen PaginationControls: `src/components/common/PaginationControls/PaginationControls.tsx`
- Komponen PaginationNav: `src/components/common/PaginationControls/PaginationNav.tsx`
- Type PaginationInfo: `src/types/Admin.d.ts`

---

## Verifikasi

1. **Frontend:** `npx tsc --noEmit && npm run build` tanpa error
2. **Test manual:**
   - Login dosen → Kelas → classroom list menampilkan pagination di bawah grid
   - Ganti "Baris per halaman" → list update sesuai limit baru
   - Klik "Selanjutnya" / "Sebelumnya" → halaman berganti, URL berubah `?page=X&limit=Y`
   - Kombinasikan dengan search/filter → pagination tetap bekerja, page di-reset saat filter berubah
   - Login mahasiswa → hal yang sama bisa dilakukan
   - Refresh halaman dengan `?page=2&limit=5` → pagination tetap aktif
