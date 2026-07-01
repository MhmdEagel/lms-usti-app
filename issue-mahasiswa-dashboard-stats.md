# Issue: Dashboard Stats Mahasiswa — Tugas Belum Dikerjakan

## Goal

Ganti card stats hardcoded ("100", "100 dari 200") di dashboard mahasiswa dengan card yang menampilkan **list tugas yang belum dikerjakan** beserta chips status: "Tugas Mendatang" (sisa hari) dan "Tugas Terlambat". Hapus card "Jumlah Kelas" dan "Jumlah Tugas" yang ada.

---

## Kondisi Saat Ini

**Frontend:**
- `DashboardStudent.tsx` render 2 card hardcoded: "Jumlah Kelas" (100) dan "Jumlah Tugas" (100 dari 200)
- Tidak ada server action untuk data dashboard mahasiswa
- Tidak ada skeleton — hanya `<p>Loading...</p>`
- Pola dosen dashboard sudah ada sebagai referensi: `DashboardDosen.tsx` → `DashboardStatsCards` + `WaitingGradeList` + `WeeklySchedule`

**Backend:**
- `GET /classroom/dosen/dashboard-stats` — endpoint dosen (count classrooms, students, assignments)
- Tidak ada endpoint untuk mahasiswa dashboard stats
- Assignment model punya `deadline` field, submission punya `status` dan `score`

---

## Data Yang Diperlukan

Dari semua kelas yang diikuti mahasiswa, ambil semua tugas lalu filter:
1. **Tugas Mendatang** — deadline belum lewat, mahasiswa belum submit
2. **Tugas Terlambat** — deadline sudah lewat, mahasiswa belum submit

Response:
```ts
interface IMahasiswaDashboardStats {
  upcoming_assignments: IMahasiswaAssignmentItem[];  // deadline > now, belum submit
  overdue_assignments: IMahasiswaAssignmentItem[];   // deadline <= now, belum submit
}

interface IMahasiswaAssignmentItem {
  assignment_id: string;
  assignment_title: string;
  classroom_id: string;
  classroom_name: string;
  deadline: string | null;
  days_remaining: number | null;  // null = no deadline, negative = overdue
}
```

---

## Tahap Implementasi

### Tahap 1 — Backend: Tambah Type Response

**File:** `lms-usti-be/data/classroom.go`

Tambah struct:
```go
type MahasiswaAssignmentItem struct {
    AssignmentID    string  `json:"assignment_id"`
    AssignmentTitle string  `json:"assignment_title"`
    ClassroomID     string  `json:"classroom_id"`
    ClassroomName   string  `json:"classroom_name"`
    Deadline        *string `json:"deadline"`
    DaysRemaining   *int    `json:"days_remaining"`
}

type MahasiswaDashboardStatsResponse struct {
    UpcomingAssignments []MahasiswaAssignmentItem `json:"upcoming_assignments"`
    OverdueAssignments  []MahasiswaAssignmentItem `json:"overdue_assignments"`
}
```

**Verifikasi:** `go build ./...`

---

### Tahap 2 — Backend: Tambah Repository Query

**File:** `lms-usti-be/repositories/classroom_repository.go`

Tambah method `GetMahasiswaDashboardStats(mahasiswaId string)`:
1. Query semua assignment dari kelas yang diikuti mahasiswa (JOIN `classroom_mahasiswas` + `assignments`)
2. LEFT JOIN `submissions` untuk cek apakah mahasiswa sudah submit
3. Filter: `submissions.id IS NULL` (belum submit)
4. Split jadi 2 grup:
   - **Upcoming**: `deadline IS NULL OR deadline > NOW()` → hitung `days_remaining = DATEDIFF(deadline, NOW())`
   - **Overdue**: `deadline <= NOW()` dan `deadline IS NOT NULL`
5. Return `MahasiswaDashboardStatsResponse`

**Verifikasi:** `go build ./...`

---

### Tahap 3 — Backend: Tambah Service Method

**File:** `lms-usti-be/services/classroom_service.go`

Tambah method `GetMahasiswaDashboardStats(mahasiswaId string)` — passthrough ke repository.

**File:** `lms-usti-be/services/classroom_service.go` (interface)

Tambah signature ke interface.

**Verifikasi:** `go build ./...`

---

### Tahap 4 — Backend: Tambah Controller Handler

**File:** `lms-usti-be/controllers/classroom_controller.go`

Tambah handler `GetMahasiswaDashboardStats` — pola sama seperti `GetDashboardStats`:
1. Extract user dari context
2. Panggil service
3. Return response

**Verifikasi:** `go build ./...`

---

### Tahap 5 — Backend: Tambah Route

**File:** `lms-usti-be/router/api.go`

Tambah route:
```go
classroom.GET("/mahasiswa/dashboard-stats", classroomController.GetMahasiswaDashboardStats)
```

**Verifikasi:** `go build ./...`

---

### Tahap 6 — Frontend: Tambah TypeScript Types

**File:** `lms-usti-fe/src/types/Classroom.d.ts`

Tambah interfaces:
```ts
interface IMahasiswaAssignmentItem {
  assignment_id: string;
  assignment_title: string;
  classroom_id: string;
  classroom_name: string;
  deadline: string | null;
  days_remaining: number | null;
}

interface IMahasiswaDashboardStats {
  upcoming_assignments: IMahasiswaAssignmentItem[];
  overdue_assignments: IMahasiswaAssignmentItem[];
}
```

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 7 — Frontend: Tambah Service Method

**File:** `lms-usti-fe/src/services/classroom.service.ts`

Tambah method:
```ts
getMahasiswaDashboardStats: () =>
  instance.get(`${endpoint.CLASSROOM}/mahasiswa/dashboard-stats`),
```

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 8 — Frontend: Tambah Server Action

**File:** `lms-usti-fe/src/actions/get-mahasiswa-dashboard-stats.ts` (baru)

Server action yang wrap `classroomServices.getMahasiswaDashboardStats()`. Return `{ upcoming: IMahasiswaAssignmentItem[], overdue: IMahasiswaAssignmentItem[] }`.

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 9 — Frontend: Buat MahasiswaAssignmentList Component

**File:** `src/components/views/Dashboard/DashboardStudent/MahasiswaAssignmentList/MahasiswaAssignmentList.tsx` (baru)

Server component yang:
1. Panggil server action `getMahasiswaDashboardStats()`
2. Render Card dengan header "Tugas Yang Perlu Dikerjakan"
3. Jika tidak ada tugas: tampilkan pesan "Semua tugas sudah dikerjakan"
4. Jika ada tugas: render 2 grup:
   - **Tugas Mendatang** — chip hijau/kuning "X hari lagi", list tugas dengan nama kelas
   - **Tugas Terlambat** — chip merah "Terlambat", list tugas
5. Setiap item tugas: link ke halaman tugas (`/mahasiswa/kelas/:classroomId/tugas/:assignmentId`)

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 10 — Frontend: Buat Skeleton Component

**File:** `src/components/views/Dashboard/DashboardStudent/MahasiswaAssignmentList/MahasiswaAssignmentListSkeleton.tsx` (baru)

Skeleton loading state — pola sama seperti `WaitingGradeListSkeleton`.

**Verifikasi:** `npx tsc --noEmit`

---

### Tahap 11 — Frontend: Update DashboardStudent

**File:** `src/components/views/Dashboard/DashboardStudent/DashboardStudent.tsx`

1. Hapus card hardcoded "Jumlah Kelas" dan "Jumlah Tugas"
2. Tambah section `MahasiswaAssignmentList` di dalam `<Suspense>` + skeleton
3. Susunan: Assignment List → Weekly Schedule

**Verifikasi:** `npx tsc --noEmit && npm run build`

---

## Ringkasan File yang Diubah

| File | Layer | Tindakan |
|------|-------|----------|
| `data/classroom.go` | Backend | Tambah 2 struct response |
| `repositories/classroom_repository.go` | Backend | Tambah `GetMahasiswaDashboardStats` |
| `services/classroom_service.go` | Backend | Tambah method + interface |
| `controllers/classroom_controller.go` | Backend | Tambah handler |
| `router/api.go` | Backend | Tambah route |
| `types/Classroom.d.ts` | Frontend | Tambah 2 interfaces |
| `services/classroom.service.ts` | Frontend | Tambah method |
| `actions/get-mahasiswa-dashboard-stats.ts` | Frontend | Baru — server action |
| `MahasiswaAssignmentList.tsx` | Frontend | Baru — component |
| `MahasiswaAssignmentListSkeleton.tsx` | Frontend | Baru — skeleton |
| `DashboardStudent.tsx` | Frontend | Update — ganti hardcoded cards |

---

## Referensi

- `DashboardDosen.tsx` + `ClassroomCount.tsx` — pola dashboard dosen
- `WaitingGradeList.tsx` — pola list tugas dengan grouping
- `get-dashboard-stats.ts` — pola server action
- `classroom_repository.go` GetDashboardStats — pola query aggregation

---

## Verifikasi

1. **Backend:** `go build ./...` tanpa error
2. **Frontend:** `npx tsc --noEmit && npm run build` tanpa error
3. **Test manual:**
   - Login mahasiswa → dashboard menampilkan tugas yang belum dikerjakan
   - Tugas dengan deadline masih valid: chip "X hari lagi"
   - Tugas yang sudah lewat deadline: chip "Terlambat"
   - Semua tugas sudah dikerjakan: pesan "Semua tugas sudah dikerjakan"
   - Klik tugas → navigasi ke halaman detail tugas
   - Loading skeleton muncul saat fetch data
