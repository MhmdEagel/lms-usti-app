# Issue: Tambah Pencarian untuk List Materi dan List Tugas di Detail Kelas

## Goal

Tambahkan fitur pencarian pada halaman list materi dan list tugas di detail kelas, mirip dengan fitur pencarian yang sudah ada di list kelas. Pencarian hanya berupa input search (tanpa filter). Gunakan hook `useDebounce` yang sudah tersedia.

---

## Kondisi Saat Ini

**Backend** — repository dan controller belum support parameter `search`:
- `MaterialRepository.FindAll` hanya menerima `classroomId` + `pagination` — tidak ada filter search
- `AssignmentRepository.FindAll` hanya menerima `classroomId` + `pagination` — tidak ada filter search
- Controller `MaterialController.FindAll` dan `AssignmentController.FindAll` hanya baca query param `page` + `limit`

**Frontend** — komponen sudah ada tapi belum menerima search param:
- `Material.tsx` — async server component, fetch data tanpa search
- `Assignment.tsx` — async server component, fetch data tanpa search
- `material.service.ts` — `findAllMaterials` hanya terima `page` + `limit`
- `assignment.service.ts` — `findAllAssignments` hanya terima `page` + `limit`
- `MaterialHeader.tsx` — belum ada SearchBar
- `AssignmentHeader.tsx` — belum ada SearchBar
- Route pages (dosen + mahasiswa) sudah menerima `searchParams` tapi belum pass `search` ke komponen
- Hook `useDebounce` sudah tersedia di `src/hooks/useDebounce.tsx`
- Komponen `SearchBar` sudah tersedia di `src/components/ui/searchfield.tsx`

**Model DB:**
- Material: field `title` bisa di-search (LIKE)
- Assignment: field `title` bisa di-search (LIKE)

---

## Tahap 1 — Backend: Tambah Parameter `search` di Repository Material

**File:** `repositories/material_repository.go`

Ubah method `FindAll` — tambahkan parameter `search string`:

```go
FindAll(classroomId string, search string, pagination data.Pagination) (result *data.PaginationWithData, err error)
```

Di dalam method, tambahkan kondisi LIKE sebelum query utama:

```go
if search != "" {
    query = query.Where("title LIKE ?", "%"+search+"%")
}
```

Update interface `MaterialRepositoryInterface` dan semua caller.

**Verifikasi:** `go build ./...`

---

## Tahap 2 — Backend: Tambah Parameter `search` di Repository Assignment

**File:** `repositories/assignment_repository.go`

Sama seperti Tahap 1 — tambahkan `search string` di `FindAll`:

```go
if search != "" {
    query = query.Where("title LIKE ?", "%"+search+"%")
}
```

Update interface dan semua caller.

**Verifikasi:** `go build ./...`

---

## Tahap 3 — Backend: Tambah Parameter `search` di Service

**Files:** `services/material_service.go`, `services/assignment_service.go`

Ubah method `FindAll` di kedua service — tambahkan parameter `search string`, teruskan ke repository:

```go
func (m *MaterialService) FindAll(classroomId string, search string, pagination data.Pagination) (*data.PaginationWithData, error) {
    // ...
    paginatedResult, err = m.materialRepository.FindAll(classroom.ID, search, pagination)
    // ...
}
```

Update interface dan semua caller.

**Verifikasi:** `go build ./...`

---

## Tahap 4 — Backend: Tambah Parameter `search` di Controller

**Files:** `controllers/material_controller.go`, `controllers/assignment_controller.go`

Di method `FindAll`, baca query param `search` dari request:

```go
search := c.Query("search")
```

Teruskan ke service:

```go
paginatedResult, err := m.materialService.FindAll(id, search, pagination)
```

**Verifikasi:** `go build ./...`

---

## Tahap 5 — Frontend: Update Service Methods

**Files:** `services/material.service.ts`, `services/assignment.service.ts`

Tambah parameter `search` di type params:

```ts
findAllMaterials: (classroomId: string, params?: { page?: number; limit?: number; search?: string }) =>
  instance.get(`${endpoint.CLASSROOM}/${classroomId}/materials`, { params }),
```

Sama untuk `findAllAssignments`.

**Verifikasi:** `npx tsc --noEmit`

---

## Tahap 6 — Frontend: Update Route Pages (4 halaman)

**Files:**
- `src/app/dosen/kelas/[classroomId]/(detail-kelas)/materi/page.tsx`
- `src/app/dosen/kelas/[classroomId]/(detail-kelas)/tugas/page.tsx`
- `src/app/mahasiswa/kelas/[classroomId]/(detail-kelas)/materi/page.tsx`
- `src/app/mahasiswa/kelas/[classroomId]/(detail-kelas)/tugas/page.tsx`

Tambah `search?: string` ke `searchParams` type, baca `search` dari params, pass ke komponen:

```tsx
const search = sp.search || "";
```

Pass ke komponen `Material` / `Assignment` sebagai prop baru.

**Verifikasi:** `npx tsc --noEmit`

---

## Tahap 7 — Frontend: Update Komponen Material & Assignment

**Files:** `Material.tsx`, `Assignment.tsx`

Tambah prop `search: string` di kedua komponen. Pass ke service call:

```tsx
const res = await materialServices.findAllMaterials(classroomId, { page, limit, search });
```

**Verifikasi:** `npx tsc --noEmit`

---

## Tahap 8 — Frontend: Tambah SearchBar ke Header

**Files:** `MaterialHeader.tsx`, `AssignmentHeader.tsx`

Tambahkan `SearchBar` di bawah judul, import dari `@/components/ui/searchfield`:

```tsx
import { SearchBar } from "@/components/ui/searchfield";

// di render:
<div className="pb-4 border-b-2 flex items-center gap-4">
  <div className="text-base md:text-xl font-semibold">Materi Kelas</div>
  <div className="flex-1">
    <SearchBar />
  </div>
  {userRole === "DOSEN" ? <CreateMaterialDialog classroomId={classroomId} /> : null}
</div>
```

**Catatan:** `SearchBar` sudah menggunakan `useDebounce` secara internal (500ms delay) dan write ke URL search param `?search=...`.

**Verifikasi:** `npx tsc --noEmit && npm run build`

---

## Ringkasan File yang Diubah

| File | Layer | Tindakan |
|------|-------|----------|
| `repositories/material_repository.go` | Backend | Ubah `FindAll` — tambah `search` param + LIKE query |
| `repositories/assignment_repository.go` | Backend | Ubah `FindAll` — tambah `search` param + LIKE query |
| `services/material_service.go` | Backend | Ubah `FindAll` — teruskan `search` ke repository |
| `services/assignment_service.go` | Backend | Ubah `FindAll` — teruskan `search` ke repository |
| `controllers/material_controller.go` | Backend | Baca `search` dari query param |
| `controllers/assignment_controller.go` | Backend | Baca `search` dari query param |
| `services/material.service.ts` | Frontend | Tambah `search` ke type params |
| `services/assignment.service.ts` | Frontend | Tambah `search` ke type params |
| `app/dosen/.../materi/page.tsx` | Frontend | Baca `search` dari searchParams, pass ke Material |
| `app/dosen/.../tugas/page.tsx` | Frontend | Baca `search` dari searchParams, pass ke Assignment |
| `app/mahasiswa/.../materi/page.tsx` | Frontend | Baca `search` dari searchParams, pass ke Material |
| `app/mahasiswa/.../tugas/page.tsx` | Frontend | Baca `search` dari searchParams, pass ke Assignment |
| `Material/Material.tsx` | Frontend | Tambah prop `search`, pass ke service |
| `Assignment/Assignment.tsx` | Frontend | Tambah prop `search`, pass ke service |
| `MaterialHeader/MaterialHeader.tsx` | Frontend | Tambah `<SearchBar />` |
| `AssignmentHeader/AssignmentHeader.tsx` | Frontend | Tambah `<SearchBar />` |

---

## Referensi

- Pattern LIKE di classroom repo: `repositories/classroom_repository.go:58` — `WHERE class_name LIKE ?`
- Hook useDebounce: `src/hooks/useDebounce.tsx`
- Komponen SearchBar: `src/components/ui/searchfield.tsx` — sudah handle debounce + URL params + reset page
- Material model: `model/material.go` — field `Title` adalah target search
- Assignment model: `model/assignment.go` — field `Title` adalah target search
- Material repo interface: `repositories/material_repository.go:14-23`
- Assignment repo interface: `repositories/assignment_repository.go:14-27`
- Material service interface: `services/material_service.go:16-22`
- Assignment service interface: `services/assignment_service.go:19-25`

---

## Verifikasi

1. **Backend:** `go build ./...` tanpa error
2. **Frontend:** `npx tsc --noEmit && npm run build` tanpa error
3. **Test manual:**
   - Login dosen → buka kelas → tab Materi → ketik di search → list materi terfilter
   - Login dosen → buka kelas → tab Tugas → ketik di search → list tugas terfilter
   - Login mahasiswa → buka kelas → tab Materi → search berfungsi
   - Login mahasiswa → buka kelas → tab Tugas → search berfungsi
   - Clear search → kembali ke full list
   - Search yang kosong / whitespace → return full list
