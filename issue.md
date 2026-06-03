# Issue: Unit Test Announcement API Backend

## Goal

Membuat unit test untuk endpoint Announcement API menggunakan `net/http/httptest` sesuai panduan Gin Testing. Instruksi high-level untuk junior programmer / AI model murah.

**File yang dibuat:**
- `lms-usti-be/main_announcement_test.go`

**Timeout:** `go test -timeout 60s -run "TestAnnouncement" -v`

**Konvensi test:**
- User sudah teraktivasi secara default (`seedUser` set `EmailVerified` valid)
- Semua test bersihkan DB di awal setiap sub-test
- File dummy sudah tersedia di folder `dummy/`

---

## Endpoint yang Ditest

### Announcement (`/lms-usti-api/classroom/:id/announcements`)

| # | Method | Path | Auth | Role | Binding |
|---|--------|------|------|------|---------|
| 1 | POST | `/classroom/:id/announcements` | Ya | DOSEN | JSON (`ShouldBindJSON`) |
| 2 | GET | `/classroom/:id/announcements` | Ya | Any | - |
| 3 | DELETE | `/classroom/:id/announcements/:announcementId` | Ya | DOSEN | - |

**Catatan:** Announcement tidak punya attachment/file upload, jadi tidak perlu test media upload untuk endpoint ini.

---

## Tahapan

### Tahap 1 — Setup Test Infrastructure

**Perlu diupdate di `main_auth_test.go`:**

1. Tambahkan model ke `setupTestDB()` AutoMigrate:
   - `model.Announcement`

2. Tambahkan table ke `cleanupDatabase()`:
   - `announcements` (sebelum `classrooms` karena FK dependency)

---

### Tahap 2 — Setup Router untuk Announcement Test

Buat `setupAnnouncementTestRouter(db)` di `main_announcement_test.go` yang include:
- Auth routes (login, register)
- Classroom routes dengan middleware (auth + ACL)
- Announcement routes (`/:id/announcements`, `/:id/announcements/:announcementId`)

**Kenapa tidak perlu media routes:** Announcement tidak punya file attachment.

---

### Tahap 3 — Test Announcement: Create

**Sub-test:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Create berhasil | title + content valid | 200 |
| Title kosong | title="" | 400 |
| Content kosong | content="" | 400 |
| Tanpa token | - | 401 |
| Token MAHASISWA | role=MAHASISWA | 403 |
| Classroom tidak ada | classroom ID random | 404 |

**Perhatian binding:** Announcement pakai JSON binding (`ShouldBindJSON`). `DosenId` diambil dari JWT context (bukan dari request body).

**Flow test Create:**
1. Seed user DOSEN
2. Login untuk dapat token
3. Seed classroom
4. Kirim POST request dengan JSON body `{"title":"...", "content":"..."}`
5. Pastikan response 200 dan announcement tersimpan

---

### Tahap 4 — Test Announcement: FindAll

**Sub-test FindAll:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Ada announcements | seed announcement di classroom | 200 + array |
| Kosong | classroom tanpa announcement | 200 + array kosong |
| Classroom tidak ada | ID random | 404 |

**Flow test FindAll:**
1. Seed user DOSEN + classroom
2. Create announcement via POST
3. Kirim GET request ke `/classroom/:id/announcements`
4. Pastikan response 200 dan ada data

---

### Tahap 5 — Test Announcement: Delete

**Sub-test Delete:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Hapus berhasil | announcement ID valid | 200 |
| Announcement tidak ada | ID random | 404 |
| Tanpa token | - | 401 |
| Token MAHASISWA | role=MAHASISWA | 403 |

**Flow test Delete:**
1. Seed user DOSEN + classroom
2. Create announcement via POST
3. Ambil announcement ID dari response
4. Kirim DELETE request ke `/classroom/:id/announcements/:announcementId`
5. Pastikan response 200

---

## File yang Terlibat

| File | Aksi |
|------|------|
| `main_auth_test.go` | Edit — tambah model di `setupTestDB()` + `cleanupDatabase()` |
| `main_announcement_test.go` | Baru — semua test announcement |

---

## Referensi

- Panduan testing Gin: https://gin-gonic.com/id/docs/testing/
- Setup test existing: `main_auth_test.go`
- Helper functions: `seedUser()`, `seedClassroom()`, `loginAndGetToken()`, `makeRequest()`, `parseResponse()`
- `handleError()` / `bindJSONError()`: `controllers/auth_controller.go`
- Announcement routes: `router/api.go:76-78`
- Announcement controller: `controllers/announcement_controller.go`
- Announcement service: `services/announcement_service.go`
- Announcement model: `model/announcement.go`
- Auth middleware: `middleware/auth.go`
- ACL middleware: `middleware/acl.go`
- JWT: `lib/jwt.go` — `lib.CreateToken(fullname, email, role, userId)`

---

## Catatan Penting

1. **Announcement binding:** `ShouldBindJSON` (application/json). Field `title` dan `content` wajib.
2. **`DosenId` diambil dari JWT context**, bukan dari request body. Controller extract user dari `ctx.Get("user")`.
3. **Announcement tidak punya attachment** — tidak perlu test file upload.
4. **Gunakan `t.Parallel()` atau tidak** — karena pakai SQLite in-memory, jangan pakai `t.Parallel()` di sub-test yang share DB yang sama.
5. **`seedClassroom`** sudah ada di `main_classroom_test.go` — bisa langsung dipakai.
