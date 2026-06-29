# Issue: Tambah Paginasi pada List Submissions

## Goal

Tambahkan pola paginasi yang sama dengan material dan classroom untuk endpoint `FindAll` submissions — baik di backend maupun frontend.

---

## Kondisi Saat Ini

**Backend:**
- `SubmissionRepository.FindAllByAssignmentId` — fetch semua submission tanpa paginasi
- `SubmissionService.FindAll` — return `[]SubmissionResponse` tanpa paginasi
- `SubmissionController.FindAll` — tidak baca query param `page`/`limit`, return `NewResponse` (bukan `NewPaginationResponse`)

**Frontend:**
- `assignment.service.ts` — `findSubmissions` tidak kirim params `page`/`limit`
- Belum ada rendering `PaginationControls` / `PaginationNav` di halaman submission

**Referensi pola yang sudah ada:**
- Material: `material_repository.go:49-61` — `FindAll` dengan `lib.Paginate`, return `*data.PaginationWithData`
- Material controller: `material_controller.go:37-54` — baca `page`/`limit` dari query, return `NewPaginationResponse`
- Classroom: `classroom_repository.go:54-86` — `FindAllByDosenId` dengan `lib.Paginate`

---

## Backend: Tahap Implementasi

### Tahap 1 — Update Repository

**File:** `repositories/submission_repository.go`

Ubah method `FindAllByAssignmentId` — tambahkan parameter `pagination data.Pagination`, gunakan `lib.Paginate` scope, return `*data.PaginationWithData`:

```go
func (s *SubmissionRepository) FindAllByAssignmentId(
    assignmentId string,
    pagination data.Pagination,
) (result *data.PaginationWithData, err error) {
    var submissions []model.Submission
    result = &data.PaginationWithData{Pagination: pagination}
    query := s.Db.Preload("User").Where("assignment_id = ?", assignmentId)
    if err := query.Scopes(lib.Paginate(submissions, &pagination, query)).Find(&submissions).Error; err != nil {
        return nil, err
    }
    result.Data = submissions
    result.Pagination = pagination
    return result, nil
}
```

Update interface `SubmissionRepositoryInterface` — tambahkan parameter `pagination` di signature `FindAllByAssignmentId`.

**Verifikasi:** `go build ./...`

---

### Tahap 2 — Update Service

**File:** `services/submission_service.go`

Ubah method `FindAll` — tambahkan parameter `pagination data.Pagination`, teruskan ke repository, return `*data.PaginationWithData`:

```go
func (s *SubmissionService) FindAll(
    assignmentId string,
    pagination data.Pagination,
) (paginatedResult *data.PaginationWithData, err error) {
    paginatedResult, err = s.submissionRepository.FindAllByAssignmentId(assignmentId, pagination)
    if err != nil {
        return nil, err
    }
    // map model ke response, timpa paginatedResult.Data
    var submissions []data.SubmissionResponse
    for _, v := range paginatedResult.Data.([]model.Submission) {
        // ... mapping seperti sekarang
    }
    paginatedResult.Data = submissions
    return paginatedResult, nil
}
```

Update interface `SubmissionServiceInterface` — tambahkan parameter `pagination`.

**Verifikasi:** `go build ./...`

---

### Tahap 3 — Update Controller

**File:** `controllers/submission_controller.go`

Ubah method `FindAll` — baca `page` dan `limit` dari query params, buat `data.Pagination`, gunakan `NewPaginationResponse`:

```go
func (s *SubmissionController) FindAll(ctx *gin.Context) {
    assignmentId := ctx.Param("assignmentId")
    limit, _ := strconv.Atoi(ctx.Query("limit"))
    page, _ := strconv.Atoi(ctx.Query("page"))

    pagination := data.Pagination{Limit: limit, Current: page}
    paginatedResult, err := s.submissionService.FindAll(assignmentId, pagination)
    if err != nil {
        // ...
    }
    res := data.NewPaginationResponse(http.StatusOK, "success", paginatedResult.Pagination, paginatedResult.Data)
    ctx.JSON(http.StatusOK, res)
}
```

**Verifikasi:** `go build ./...`

---

## Frontend: Tahap Implementasi

### Tahap 4 — Update Service Frontend

**File:** `src/services/assignment.service.ts`

Tambah params `page` dan `limit` ke `findSubmissions`:

```ts
findSubmissions: (classroomId: string, assignmentId: string, params?: { page?: number; limit?: number }) =>
  instance.get(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}/submissions`, { params }),
```

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 5 — Update Route Page (penilaian)

**File:** `src/app/dosen/kelas/[classroomId]/tugas/[assignmentId]/(detail-tugas)/penilaian/page.tsx`

Baca `searchParams` untuk `page` dan `limit`, pass ke component:

```tsx
export default async function PenilaianPage({
  params,
  searchParams,
}: {
  params: Promise<{ classroomId: string; assignmentId: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const { classroomId, assignmentId } = await params;
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;
  const limit = sp.limit ? parseInt(sp.limit) : 10;
  return (
    <AssignmentDetailGrading
      classroomId={classroomId}
      assignmentId={assignmentId}
      page={page}
      limit={limit}
    />
  );
}
```

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 6 — Update Component & Render Pagination

**File:** `AssignmentDetailGrading/AssignmentDetailGrading.tsx` dan `GradingContent.tsx`

1. Terima props `page` dan `limit`
2. Pass ke service call `findSubmissions(classroomId, assignmentId, { page, limit })`
3. Extract `pagination` dari response: `res.data?.pagination`
4. Render `PaginationControls` dan `PaginationNav` di bawah list submission

**Verifikasi:** `npx tsc --noEmit && npm run build`

---

## Ringkasan File yang Diubah

| File | Layer | Tindakan |
|------|-------|----------|
| `repositories/submission_repository.go` | Backend | Ubah `FindAllByAssignmentId` — tambah `pagination` + `lib.Paginate` |
| `services/submission_service.go` | Backend | Ubah `FindAll` — tambah `pagination`, return `*PaginationWithData` |
| `controllers/submission_controller.go` | Backend | Baca `page`/`limit` dari query, return `NewPaginationResponse` |
| `src/services/assignment.service.ts` | Frontend | Tambah params `page`/`limit` ke `findSubmissions` |
| `penilaian/page.tsx` | Frontend | Baca `searchParams`, pass `page`/`limit` ke component |
| `AssignmentDetailGrading.tsx` | Frontend | Pass `page`/`limit` ke fetch |
| `GradingContent.tsx` | Frontend | Render `PaginationControls` + `PaginationNav` |

---

## Referensi

- Pola material: `repositories/material_repository.go:49-61`, `controllers/material_controller.go:37-54`
- `lib.Paginate`: `lib/utils.go:234-243` — scope GORM untuk offset/limit + hitung total
- `data.Pagination`: `data/response.go:43-48` — struct `{Limit, TotalPages, Total, Current}`
- `NewPaginationResponse`: `data/response.go:32-41`
- PaginationControls: `components/common/PaginationControls/PaginationControls.tsx`
- PaginationNav: `components/common/PaginationControls/PaginationNav.tsx`

---

## Verifikasi

1. **Backend:** `go build ./...` tanpa error
2. **Frontend:** `npx tsc --noEmit && npm run build` tanpa error
3. **Test manual:**
   - Login dosen → buka tugas → tab Penilaian → list submission terpaginasi
   - Ganti "Baris per halaman" → list update
   - Klik "Selanjutnya" / "Sebelumnya" → navigasi halaman
   - Jika submission hanya 1 halaman, navigasi disable dengan benar
