# Issue: Tambahkan Pagination ke Materi & Tugas

## Goal

Tambahkan pagination ke endpoint fetch materi dan fetch tugas, menggunakan pola pagination yang sudah ada di backend (sama seperti `FindAllUsers`).

---

## Analisis

### Pola Pagination Yang Sudah Ada (Backend)

| Layer | Pattern |
|-------|---------|
| Controller | Parse `?limit=X&page=Y` → buat `data.Pagination{}` → panggil service → return `data.NewPaginationResponse()` |
| Service | Terima `data.Pagination` → panggil repository → return `data.PaginationWithData` |
| Repository | Terima `data.Pagination` → pakai `lib.Paginate(model, &pagination, db)` scope → return `*data.PaginationWithData` |
| Response | `{ meta, pagination: { limit, total_pages, total, current }, data: [] }` |

### Yang Sudah Terpaginasi

- `GET /admin/users` — FindAllUsers
- `GET /classroom/dosen/classrooms` — FindAllByDosenId
- `GET /classroom/mahasiswa/classrooms` — FindAllByMahasiswaId
- `GET /admin/audit-logs` — FindAllLogs

### Yang Belum Terpaginasi

- `GET /classroom/:id/materials` — FindAll (return semua material sekaligus)
- `GET /classroom/:id/assignments` — FindAll (return semua assignment sekaligus)

---

## Tahap 1 — Backend: Tambah Pagination ke Material

### Repository

**File:** `lms-usti-be/repositories/material_repository.go`

Update method `FindAll`:
- Terima parameter `pagination data.Pagination`
- Pakai `lib.Paginate` scope (sama seperti `UserRepository.FindAll`)
- Return `*data.PaginationWithData` bukan `([]model.Material, error)`

```go
func (m *MaterialRepository) FindAll(classroomId string, pagination data.Pagination) (result *data.PaginationWithData, err error) {
    var materials []model.Material
    result = &data.PaginationWithData{Pagination: pagination}
    query := m.Db.Where("classroom_id = ?", classroomId)
    if err := query.Scopes(lib.Paginate(materials, &pagination, query)).Find(&materials).Error; err != nil {
        return nil, err
    }
    result.Data = materials
    result.Pagination = pagination
    return result, nil
}
```

### Service

**File:** `lms-usti-be/services/material_service.go`

Update method `FindAll`:
- Terima parameter `pagination data.Pagination`
- Panggil repository dengan pagination
- Return `data.PaginationWithData`

### Interface

**File:** `lms-usti-be/services/material_service.go` (interface)

Update signature `FindAll` untuk terima `pagination data.Pagination`.

### Controller

**File:** `lms-usti-be/controllers/material_controller.go`

Update method `FindAll`:
- Parse `limit` dan `page` dari query params (sama seperti `AdminController.FindAllUsers`)
- Buat `data.Pagination{Limit: limit, Current: page}`
- Panggil service dengan pagination
- Return `data.NewPaginationResponse()` bukan `data.NewResponse()`

**Checkpoint:** `go build ./...`

---

## Tahap 2 — Backend: Tambah Pagination ke Assignment

Ulangi pola yang sama untuk assignment:

### Repository

**File:** `lms-usti-be/repositories/assignment_repository.go`

Update `FindAll` — tambah parameter `pagination data.Pagination`, pakai `lib.Paginate`.

### Service

**File:** `lms-usti-be/services/assignment_service.go`

Update `FindAll` — terima `pagination data.Pagination`, return `data.PaginationWithData`.

### Interface

Update signature `FindAll`.

### Controller

**File:** `lms-usti-be/controllers/assignment_controller.go`

Update `FindAll` — parse query params, buat `data.Pagination`, return `PaginationResponse`.

**Checkpoint:** `go build ./...`

---

## Tahap 3 — Frontend: Update Service & Type

### Type

**File:** `src/types/Classroom.d.ts` atau `src/types/Response.d.ts`

Tambah type untuk pagination response (jika belum ada):
```typescript
interface PaginationResponse<T> {
  meta: { status: number; message: string };
  pagination: {
    limit: number;
    total_pages: number;
    total: number;
    current: number;
  };
  data: T[];
}
```

### Service

**File:** `src/services/material.service.ts`

Update `findAllMaterials` — tambah param `params`:
```typescript
findAllMaterials: (classroomId: string, params?: { page?: number; limit?: number }) =>
  instance.get(`${endpoint.CLASSROOM}/${classroomId}/materials`, { params }),
```

**File:** `src/services/assignment.service.ts`

Update `findAllAssignments` — tambah param `params`:
```typescript
findAllAssignments: (classroomId: string, params?: { page?: number; limit?: number }) =>
  instance.get(`${endpoint.CLASSROOM}/${classroomId}/assignments`, { params }),
```

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 4 — Frontend: Update Material Component

### Server Action (opsional, bisa langsung di component)

**File:** `src/actions/classroom.ts` (buat baru atau update)

Tambah server action untuk fetch materials:
```typescript
export async function getMaterials(classroomId: string, params?: { page?: number; limit?: number }) {
  const res = await materialServices.findAllMaterials(classroomId, params);
  return res.data;
}
```

### Component

**File:** `src/components/views/Dashboard/DashboardDosen/Classroom/Material/Material.tsx`

Update untuk terima pagination params:
- Props: tambah `page?: number`, `limit?: number` (default dari parent)
- Terima `materials` sebagai props atau fetch di component dengan params
- Terima `pagination` info untuk kontrol UI

**File:** `src/app/dosen/kelas/[classroomId]/(detail-kelas)/materi/page.tsx`

Update untuk pass pagination params dari `searchParams`.

**File:** `src/app/mahasiswa/kelas/[classroomId]/materi/page.tsx`

Update untuk pass pagination params dari `searchParams`.

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 5 — Frontend: Update Assignment Component

Ulangi pola yang sama:

### Server Action

**File:** `src/actions/classroom.ts`

Tambah:
```typescript
export async function getAssignments(classroomId: string, params?: { page?: number; limit?: number }) {
  const res = await assignmentServices.findAllAssignments(classroomId, params);
  return res.data;
}
```

### Component

**File:** `src/components/views/Dashboard/DashboardDosen/Classroom/Assignment/Assignment.tsx`

Update — terima `page`/`limit` params, fetch data dengan params, render pagination controls.

**File:** `src/app/dosen/kelas/[classroomId]/(detail-kelas)/tugas/page.tsx`

Update — parse `searchParams`, pass ke Assignment.

**File:** `src/app/mahasiswa/kelas/[classroomId]/tugas/page.tsx`

Update — parse `searchParams`, pass ke Assignment.

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 6 — Frontend: Tambah Pagination Controls

Buat atau reuse pagination controls (seperti yang sudah ada di `UserTable`):

**File:** Reuse pola pagination dari `UserTable.tsx` — limit selector + prev/next buttons

Bisa dibuat reusable component:
```typescript
// src/components/common/PaginationControls.tsx
interface PaginationControlsProps {
  current: number;
  totalPages: number;
  limit: number;
  onNavigate: (page: number, limit?: number) => void;
}
```

Atau langsung inline di Material dan Assignment component.

**Checkpoint:** `npx tsc --noEmit`

---

## File yang Terlibat

| File | Tindakan |
|------|----------|
| `lms-usti-be/repositories/material_repository.go` | Update — tambah pagination ke FindAll |
| `lms-usti-be/services/material_service.go` | Update — tambah pagination ke FindAll |
| `lms-usti-be/controllers/material_controller.go` | Update — parse query params, return PaginationResponse |
| `lms-usti-be/repositories/assignment_repository.go` | Update — tambah pagination ke FindAll |
| `lms-usti-be/services/assignment_service.go` | Update — tambah pagination ke FindAll |
| `lms-usti-be/controllers/assignment_controller.go` | Update — parse query params, return PaginationResponse |
| `src/services/material.service.ts` | Update — tambah params |
| `src/services/assignment.service.ts` | Update — tambah params |
| `src/types/Response.d.ts` | Update — tambah PaginationResponse type |
| `src/actions/classroom.ts` | Update/buat — tambah server actions |
| `src/components/.../Material/Material.tsx` | Update — terima pagination |
| `src/components/.../Assignment/Assignment.tsx` | Update — terima pagination |
| `src/app/dosen/.../materi/page.tsx` | Update — parse searchParams |
| `src/app/mahasiswa/.../materi/page.tsx` | Update — parse searchParams |
| `src/app/dosen/.../tugas/page.tsx` | Update — parse searchParams |
| `src/app/mahasiswa/.../tugas/page.tsx` | Update — parse searchParams |

---

## Verifikasi

1. `go build ./...` — backend build sukses
2. `npx tsc --noEmit` — tanpa type error
3. `npm run build` — build sukses
4. Test manual:
   - Buka kelas → tab Materi → pagination muncul (limit selector + prev/next)
   - Buka kelas → tab Tugas → pagination muncul
   - Ubah limit → jumlah item berubah
   - Klik next/prev → halaman berubah
   - Total items dan total pages benar
   - Default: page=1, limit=10
