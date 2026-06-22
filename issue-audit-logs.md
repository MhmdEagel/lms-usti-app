# Issue: Audit Logs Otomatis untuk Aksi Admin

## Goal

Buat sistem audit log yang mencatat setiap aksi admin di dashboard (tambah/edit/hapus user). Log dibuat otomatis di backend setiap kali admin melakukan perubahan melalui aplikasi.

---

## Analisis

### Model Audit Logs (Sudah Ada, Perlu Disesuaikan)

**File:** `lms-usti-be/model/audit.go`

Saat ini:
```go
type AuditLogs struct {
    gorm.Model
    Title   string `gorm:"not null"`
    Content string `gorm:"not null"`
}
```

Yang diinginkan: rename `Content` → `Description`. `gorm.Model` sudah menyediakan `ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt`.

### Yang Belum Ada

| Komponen | Status |
|----------|--------|
| Model `AuditLogs` | ✅ Ada, perlu rename `Content` → `Description` |
| Repository | ❌ Belum ada |
| Service | ❌ Belum ada |
| Controller | ❌ Belum ada |
| Route | ❌ Belum ada |
| AutoMigrate | ❌ Belum termasuk `model.AuditLogs{}` |
| Frontend halaman Audit Logs | ✅ Placeholder "Ini halaman Audit Logs" |

### Pola Yang Ada (Referensi)

Repository pattern (`user_repository.go`):
```go
type UserRepository struct {
    Db *gorm.DB
}
func NewUserRepository(Db *gorm.DB) UserRepositoryInterface { ... }
```

---

## Tahap 1 — Backend: Update Model & Migration

**File:** `lms-usti-be/model/audit.go`

Ubah field `Content` menjadi `Description`:
```go
type AuditLogs struct {
    gorm.Model
    Title       string `gorm:"not null"`
    Description string `gorm:"not null"`
}
```

**File:** `lms-usti-be/config/database.go`

Tambah `&model.AuditLogs{}` ke daftar AutoMigrate:
```go
database.AutoMigrate(
    ..., // model yang sudah ada
    &model.AuditLogs{},
)
```

**File:** `lms-usti-be/main_auth_test.go`

Tambah `&model.AuditLogs{}` ke AutoMigrate test.

**Checkpoint:** `go build ./...`

---

## Tahap 2 — Backend: Buat Repository AuditLog

**File:** `lms-usti-be/repositories/audit_repository.go` (baru)

Buat repository mengikuti pattern `user_repository.go`:
- Struct: `AuditLogRepository` dengan field `Db *gorm.DB`
- Interface: `AuditLogRepositoryInterface`
- Constructor: `NewAuditLogRepository(Db *gorm.DB) AuditLogRepositoryInterface`
- Method:
  - `Create(log model.AuditLogs) error` — insert log baru
  - `FindAll(pagination data.Pagination) (*data.PaginationWithData, error)` — paginated list

**Checkpoint:** `go build ./...`

---

## Tahap 3 — Backend: Buat Service AuditLog

**File:** `lms-usti-be/services/audit_service.go` (baru)

Buat service:
- Struct: `AuditService` dengan field `auditLogRepository`
- Interface: `AuditServiceInterface`
- Constructor: `NewAuditService(auditLogRepository) AuditServiceInterface`
- Method:
  - `LogAction(title string, description string) error` — buat log entry baru
  - `GetAllLogs(pagination data.Pagination) (*data.PaginationWithData, error)` — get all logs

**Checkpoint:** `go build ./...`

---

## Tahap 4 — Backend: Inject AuditService ke AdminService & Log Aksi

**File:** `lms-usti-be/services/admin_service.go`

Update `AdminService`: tambah field `auditService AuditServiceInterface`

Update constructor `NewAdminService`: terima `auditService` sebagai parameter tambahan

Tambah logging di method yang sudah ada:
- **`CreateUser`** — setelah user berhasil dibuat:
  ```go
  a.auditService.LogAction(
      "Penambahan User",
      fmt.Sprintf("Menambahkan user baru: %s, %s", req.Fullname, req.Email),
  )
  ```
- **`UpdateUser`** — setelah update sukses:
  ```go
  a.auditService.LogAction(
      "Pengubahan User",
      fmt.Sprintf("Mengubah data user: %s", req.UserId),
  )
  ```
- **`DeleteUser`** — sebelum hapus (ambil data user dulu untuk log):
  ```go
  a.auditService.LogAction(
      "Penghapusan User",
      fmt.Sprintf("Menghapus user dengan ID: %s", userId),
  )
  ```

**File:** `lms-usti-be/router/api.go`

Update inisialisasi `AdminService`:
```go
auditLogRepository := repositories.NewAuditLogRepository(Db)
auditService := services.NewAuditService(auditLogRepository)
adminService := services.NewAdminService(userRepository, verificationRepository, auditService)
```

**Checkpoint:** `go build ./...`

---

## Tahap 5 — Backend: Buat Controller & Route GET Audit Logs

**File:** `lms-usti-be/controllers/audit_controller.go` (baru)

Buat controller:
- Struct: `AuditController` dengan field `auditService`
- Constructor: `NewAuditController(auditService) *AuditController`
- Method: `FindAllLogs(ctx *gin.Context)` — parse query `page`/`limit`, panggil service, return `PaginationResponse`

**File:** `lms-usti-be/router/api.go`

Tambah route baru:
```go
adminAudit := api.Group("/admin/audit-logs")
adminAudit.Use(authMiddleware.Handle(), aclMiddleware.Handle([]string{"ADMIN"}))
{
    adminAudit.GET("", auditController.FindAllLogs)
}
```

**Checkpoint:** `go build ./...`

---

## Tahap 6 — Frontend: Type, Service & Server Action Audit Logs

**File:** `src/types/Admin.d.ts`

Tambah type:
```typescript
interface IAuditLog {
  ID: number;
  Title: string;
  Description: string;
  CreatedAt: string;
  UpdatedAt: string;
}
```

**File:** `src/services/admin.service.ts`

Tambah method:
```typescript
getAuditLogs: (params?: { page?: number; limit?: number }) =>
  instance.get(`${endpoint.ADMIN}/audit-logs`, { params }),
```

**File:** `src/actions/admin.ts`

Tambah server action:
```typescript
export async function getAuditLogs(params?: { page?: number; limit?: number }) {
  const res = await adminServices.getAuditLogs(params);
  return res.data;
}
```

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 7 — Frontend: Update Halaman Audit Logs

**File:** `src/app/admin/audit/page.tsx`

Update jadi server component async dengan pagination (seperti `users/page.tsx`):
- Parse `searchParams` untuk `page` dan `limit`
- Wrap `AuditLogs` dengan `<Suspense fallback={<AuditLogsSkeleton />}>`

**File:** `src/components/views/Dashboard/DashboardAdmin/AuditLogs/AuditLogs.tsx`

Ganti dari placeholder menjadi server component:
- Fetch data dari `getAuditLogs()`
- Tabel dengan kolom: No, Title, Description, Tanggal (CreatedAt)
- Pakai shadcn `Table` component
- Pagination controls (limit selector + prev/next)

**File:** `src/components/views/Dashboard/DashboardAdmin/AuditLogs/AuditLogsSkeleton.tsx` (baru)

Buat skeleton loading dengan pattern `UserTableSkeleton`:
- 5 baris placeholder, 4 kolom

**Checkpoint:** `npx tsc --noEmit`

---

## File yang Terlibat

| File | Tindakan |
|------|----------|
| `lms-usti-be/model/audit.go` | Update (rename `Content` → `Description`) |
| `lms-usti-be/config/database.go` | Update (tambah AutoMigrate) |
| `lms-usti-be/main_auth_test.go` | Update (tambah AutoMigrate test) |
| `lms-usti-be/repositories/audit_repository.go` | Buat baru |
| `lms-usti-be/services/audit_service.go` | Buat baru |
| `lms-usti-be/services/admin_service.go` | Update (inject + log calls) |
| `lms-usti-be/controllers/audit_controller.go` | Buat baru |
| `lms-usti-be/router/api.go` | Update (inisialisasi + route) |
| `src/types/Admin.d.ts` | Update (tambah IAuditLog) |
| `src/services/admin.service.ts` | Update (tambah getAuditLogs) |
| `src/actions/admin.ts` | Update (tambah getAuditLogs) |
| `src/app/admin/audit/page.tsx` | Update (pagination + Suspense) |
| `src/components/views/Dashboard/DashboardAdmin/AuditLogs/AuditLogs.tsx` | Update (tabel + data) |
| `src/components/views/Dashboard/DashboardAdmin/AuditLogs/AuditLogsSkeleton.tsx` | Buat baru |

---

## Backend Response Format

```json
// GET /admin/audit-logs?page=1&limit=10
{
  "meta": { "status": 200, "message": "successfully find all audit logs" },
  "pagination": { "limit": 10, "total_pages": 1, "total": 3, "current": 1 },
  "data": [
    {
      "ID": 1,
      "Title": "Penambahan User",
      "Description": "Menambahkan user baru: John Doe, john@email.com",
      "CreatedAt": "2026-06-22T10:00:00Z",
      "UpdatedAt": "2026-06-22T10:00:00Z"
    }
  ]
}
```

---

## Verifikasi

1. `go build ./...` — backend build sukses
2. `npx tsc --noEmit` — tanpa type error
3. `npm run build` — build sukses
4. Test manual:
   - Login sebagai ADMIN
   - Buat user baru → buka Audit Logs → log "Penambahan User" muncul
   - Edit user → log "Pengubahan User" muncul
   - Hapus user → log "Penghapusan User" muncul
   - Tabel Audit Logs menampilkan data dengan benar
   - Pagination berfungsi
   - Skeleton muncul saat loading
