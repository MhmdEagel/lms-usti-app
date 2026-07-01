# Issue: Fitur Komentar (Backend)

## Goal

Buat fitur komentar dengan single table (`comments`) yang bisa digunakan untuk materi, tugas, dan pengumuman. Satu controller untuk semua tipe komentar. Routes nested di bawah masing-masing resource.

---

## Kondisi Saat Ini

- Belum ada fitur komentar di aplikasi
- Model, repository, service, controller pattern sudah ada dan konsisten
- Route registration centralized di `router/api.go`

---

## Arsitektur

### Data Model

```
comments:
  id               string (UUID, PK)
  content          string (not null, text)
  created_by       string (FK to users)
  commentable_type string (not null) -- "material", "assignment", "announcement"
  commentable_id   string (not null, indexed)
  created_at       timestamp
```

**Constants:**
- `CommentableTypeMaterial = "material"`
- `CommentableTypeAssignment = "assignment"`
- `CommentableTypeAnnouncement = "announcement"`

### Routes

```
GET    /classroom/:id/materials/:materialId/comments
POST   /classroom/:id/materials/:materialId/comments
DELETE /classroom/:id/materials/:materialId/comments/:commentId

GET    /classroom/:id/assignments/:assignmentId/comments
POST   /classroom/:id/assignments/:assignmentId/comments
DELETE /classroom/:id/assignments/:assignmentId/comments/:commentId

GET    /classroom/:id/announcements/:announcementId/comments
POST   /classroom/:id/announcements/:announcementId/comments
DELETE /classroom/:id/announcements/:announcementId/comments/:commentId
```

**ACL:**
- `GET` — DOSEN + MAHASISWA (yang terdaftar di kelas)
- `POST` — DOSEN + MAHASISWA
- `DELETE` — DOSEN (hapus semua komentar), MAHASISWA (hapus komentar sendiri)

---

## Tahap Implementasi

### Tahap 1 — Model & DTOs

**File:** `model/comment.go` (baru)

Buat struct `Comment` dengan field: `ID`, `Content`, `CreatedBy`, `User` (relation), `CommentableType`, `CommentableID`, `CreatedAt`. Tambah `BeforeCreate` hook untuk auto-generate UUID.

**File:** `data/comment.go` (baru)

Buat DTOs:
- `CommentRequest` — `Content string` dengan `binding:"required"`
- `CommentResponse` — `Id`, `Content`, `CreatedBy`, `User` (fullname + profile), `CreatedAt`

**File:** `config/database.go`

Tambah `model.Comment` ke daftar `AutoMigrate`.

**Verifikasi:** `go build ./...`

---

### Tahap 2 — Repository

**File:** `repositories/comment_repository.go` (baru)

Buat `CommentRepository` + `CommentRepositoryInterface` dengan methods:
- `FindAll(commentableType, commentableId string) ([]model.Comment, error)` — query dengan preload `User`, order by `created_at ASC`
- `Create(comment model.Comment) error`
- `Delete(commentId, createdBy string) error` — delete where `id = ? AND created_by = ?` (return `gorm.ErrRecordNotFound` jika tidak ada yang terhapus)

**Verifikasi:** `go build ./...`

---

### Tahap 3 — Service

**File:** `services/comment_service.go` (baru)

Buat `CommentService` + `CommentServiceInterface` dengan methods:
- `FindAll(commentableType, commentableId string) ([]data.CommentResponse, error)` — map model ke response
- `Create(req data.CommentRequest, commentableType, commentableId, userId string) error` — validasi classroom exists, lalu create
- `Delete(commentId, userId string) error`

**Verifikasi:** `go build ./...`

---

### Tahap 4 — Controller

**File:** `controllers/comment_controller.go` (baru)

Buat `CommentController` + `CommentControllerInterface` dengan handlers:
- `FindAll(ctx)` — baca `commentableType` dan `commentableId` dari param/parent route
- `Create(ctx)` — bind JSON, extract user dari context, baca param
- `Delete(ctx)` — extract user, cek ownership (MAHASISWA hanya bisa hapus sendiri)

**Tip:** Gunakan helper method untuk detect `commentableType` dari route path (atau pass sebagai parameter dari router).

**Verifikasi:** `go build ./...`

---

### Tahap 5 — Register Routes

**File:** `router/api.go`

Instantiate `commentRepository`, `commentService`, `commentController`. Daftarkan 9 routes nested di bawah materials, assignments, dan announcements:

```go
// Materials comments
classroom.GET("/:id/materials/:materialId/comments", commentController.FindAll)
classroom.POST("/:id/materials/:materialId/comments", commentController.Create)
classroom.DELETE("/:id/materials/:materialId/comments/:commentId", commentController.Delete)

// Assignments comments
classroom.GET("/:id/assignments/:assignmentId/comments", commentController.FindAll)
classroom.POST("/:id/assignments/:assignmentId/comments", commentController.Create)
classroom.DELETE("/:id/assignments/:assignmentId/comments/:commentId", commentController.Delete)

// Announcements comments
classroom.GET("/:id/announcements/:announcementId/comments", commentController.FindAll)
classroom.POST("/:id/announcements/:announcementId/comments", commentController.Create)
classroom.DELETE("/:id/announcements/:announcementId/comments/:commentId", commentController.Delete)
```

**Verifikasi:** `go build ./...`

---

## Ringkasan File yang Diubah

| File | Layer | Tindakan |
|------|-------|----------|
| `model/comment.go` | Model | Baru — struct Comment + BeforeCreate |
| `data/comment.go` | DTOs | Baru — CommentRequest, CommentResponse |
| `config/database.go` | Config | Tambah model ke AutoMigrate |
| `repositories/comment_repository.go` | Repository | Baru — FindAll, Create, Delete |
| `services/comment_service.go` | Service | Baru — FindAll, Create, Delete |
| `controllers/comment_controller.go` | Controller | Baru — FindAll, Create, Delete |
| `router/api.go` | Router | Daftarkan 9 routes |

---

## Referensi

- Pattern model: `model/announcement.go` — BeforeCreate hook
- Pattern repository: `repositories/announcement_repository.go` — CRUD pattern
- Pattern service: `services/announcement_service.go` — validation + mapping
- Pattern controller: `controllers/announcement_controller.go` — auth context + response
- Error helpers: `data/error.go` — `ErrInternalServer()`, `ErrNotFound()`
- Route pattern: `router/api.go` — nested routes under classroom

---

## Verifikasi

1. **Backend:** `go build ./...` tanpa error
2. **Test manual (Postman/curl):**
   - POST `/classroom/:id/materials/:materialId/comments` — buat komentar
   - GET `/classroom/:id/materials/:materialId/comments` — list komentar
   - DELETE `/classroom/:id/materials/:materialId/comments/:commentId` — hapus komentar
   - Ulangi untuk assignments dan announcements
   - Test hak akses: MAHASISWA tidak bisa hapus komentar orang lain
