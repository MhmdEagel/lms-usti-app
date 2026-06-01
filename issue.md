# Issue: Unit Test Material & Assignment API Backend

## Goal

Membuat unit test untuk endpoint Material dan Assignment API menggunakan `net/http/httptest` sesuai panduan Gin Testing. Instruksi high-level untuk junior programmer / AI model murah.

**File yang dibuat:**
- `lms-usti-be/main_material_test.go`
- `lms-usti-be/main_assignment_test.go`

**Timeout:** `go test -timeout 60s -run "TestMaterial|TestAssignment" -v`

**Konvensi test:**
- User sudah teraktivasi secara default (`seedUser` set `EmailVerified` valid)
- Semua test bersihkan DB di awal setiap sub-test
- File dummy: `dummy/test_material.pdf`, `dummy/test_video.mp4`

---

## Endpoint yang Ditest

### Material (`/lms-usti-api/classroom/:id/materials`)

| # | Method | Path | Auth | Role | Binding |
|---|--------|------|------|------|---------|
| 1 | POST | `/classroom/:id/materials` | Ya | DOSEN | Form (`ShouldBind`) |
| 2 | GET | `/classroom/:id/materials` | Ya | Any | - |
| 3 | GET | `/classroom/:id/materials/:materialId` | Ya | Any | - |
| 4 | PUT | `/classroom/:id/materials/:materialId` | Ya | DOSEN | Form (`ShouldBind`) |
| 5 | DELETE | `/classroom/:id/materials/:materialId` | Ya | DOSEN | - |

### Assignment (`/lms-usti-api/classroom/:id/assignments`)

| # | Method | Path | Auth | Role | Binding |
|---|--------|------|------|------|---------|
| 1 | POST | `/classroom/:id/assignments` | Ya | DOSEN | JSON (`ShouldBindJSON`) |
| 2 | GET | `/classroom/:id/assignments` | Ya | Any | - |
| 3 | GET | `/classroom/:id/assignments/:assignmentId` | Ya | Any | - |
| 4 | PUT | `/classroom/:id/assignments/:assignmentId` | Ya | DOSEN | JSON (`ShouldBindJSON`) |
| 5 | DELETE | `/classroom/:id/assignments/:assignmentId` | Ya | DOSEN | - |

---

## Tahapan

### Tahap 1 — Setup Test Infrastructure

**Perlu diupdate di `main_auth_test.go`:**

1. Tambahkan model ke `setupTestDB()` AutoMigrate:
   - `model.Material`, `model.MaterialAttachment`
   - `model.Assignment`, `model.AssignmentRubric`, `model.AssignmentAttachment`
   - `model.Submission`, `model.SubmissionFile`, `model.SubmissionLink`

2. Tambahkan table ke `cleanupDatabase()`:
   - `material_attachments`, `materials`
   - `assignment_attachments`, `assignment_rubrics`
   - `submission_files`, `submission_links`, `submissions`

**Helper baru (bisa di file test masing-masing atau di `main_auth_test.go`):**

- `seedClassroom(db, dosenUser) model.Classroom` — buat classroom dengan dosen
- `seedMahasiswaToClassroom(db, user, classroom)` — enroll mahasiswa ke classroom
- `makeMultipartRequest(r, method, url, fields, files, token)` — buat request multipart/form-data untuk material
- `loginAndGetToken(r, email, password) string` — login lalu ambil token

---

### Tahap 2 — Setup Router untuk Material Test

Buat `setupMaterialTestRouter(db)` yang include:
- Auth routes (login, register)
- Classroom routes dengan middleware (auth + ACL)
- Material routes (`/:id/materials`, `/:id/materials/:materialId`)
- Media routes (`/media/materials`) — untuk upload file sebelum create material

**Kenapa perlu media routes:** Material bisa punya attachment tipe FILE/VIDEO. Sebelum create material, file harus diupload dulu via media API agar ada di filesystem.

---

### Tahap 3 — Test Material: Create

**Sub-test:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Create berhasil (tanpa attachment) | title + description saja | 200 |
| Create berhasil (dengan attachment FILE) | upload file dulu, lalu attach | 200 |
| Create berhasil (dengan attachment VIDEO) | upload video dulu, lalu attach | 200 |
| Create berhasil (dengan attachment LINK) | url valid | 200 |
| Create berhasil (campur FILE + LINK) | gabungan | 200 |
| Title kosong | title="" | 400 |
| Attachment type invalid (`.php`) | type="PHP" atau type invalid | 400 |
| Tanpa token | - | 401 |
| Token MAHASISWA | role=MAHASISWA | 403 |
| Classroom tidak ada | classroom ID random | 404 |
| URL link tidak valid | url="bukan-url" | 400 |
| Attachment FILE tanpa unique_name | type=FILE, unique_name="" | 400 |

**Flow untuk test dengan attachment:**
1. Upload file via `POST /media/materials` (multipart)
2. Ambil `unique_file_name` dari response
3. Buat material dengan attachment yang reference `unique_file_name` tersebut
4. Bersihkan file setelah test selesai

**Perhatian binding:** Material pakai form binding (`ShouldBind`). Attachment dikirim sebagai field form JSON string (bukan JSON body). Content-Type: `multipart/form-data`.

---

### Tahap 4 — Test Material: FindAll, FindById, Delete

**Sub-test FindAll:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Ada materials | seed material di classroom | 200 + array |
| Kosong | classroom tanpa material | 200 + array kosong |
| Classroom tidak ada | ID random | 404 |

**Sub-test FindById:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Ada | material ID valid | 200 + data |
| Tidak ada | material ID random | 404 |

**Sub-test Delete:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Hapus berhasil | material ID valid | 200 |
| Material tidak ada | ID random | 404 |
| Tanpa token | - | 401 |
| Token MAHASISWA | role=MAHASISWA | 403 |

---

### Tahap 5 — Test Material: Update

**Sub-test:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Update berhasil | title + description baru | 200 |
| Ganti attachment | hapus lama, tambah baru | 200 |
| Material tidak ada | ID random | 404 |
| Token MAHASISWA | role=MAHASISWA | 403 |

---

### Tahap 6 — Setup Router untuk Assignment Test

Buat `setupAssignmentTestRouter(db)` yang include:
- Auth routes (login)
- Classroom routes dengan middleware
- Assignment routes
- Media routes (`/media/assignments`) — untuk upload file

---

### Tahap 7 — Test Assignment: Create

**Sub-test:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Create berhasil (tanpa attachment + rubric) | title + deadline + instruction | 200 |
| Create berhasil (dengan rubric) | + rubrics array | 200 |
| Create berhasil (dengan attachment FILE) | upload file dulu | 200 |
| Create berhasil (dengan attachment LINK) | url valid | 200 |
| Create berhasil (lengkap) | rubric + attachment campur | 200 |
| Title kosong | title="" | 400 |
| Deadline kosong | omit deadline | 400 |
| Attachment type invalid (`.php`) | type="SCRIPT" | 400 |
| Tanpa token | - | 401 |
| Token MAHASISWA | role=MAHASISWA | 403 |
| Classroom tidak ada | ID random | 404 |

**Perhatian binding:** Assignment pakai JSON binding (`ShouldBindJSON`). Content-Type: `application/json`.

---

### Tahap 8 — Test Assignment: FindAll, FindById, Delete

**Sub-test FindAll:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Ada assignments | seed data | 200 + array |
| Kosong | classroom kosong | 200 + array kosong |
| Classroom tidak ada | ID random | 404 |

**Sub-test FindById:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Ada | ID valid | 200 + data + rubrics + attachments |
| Tidak ada | ID random | 404 |

**Sub-test Delete:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Hapus berhasil | ID valid | 200 |
| Assignment tidak ada | ID random | 404 |
| Tanpa token | - | 401 |
| Token MAHASISWA | role=MAHASISWA | 403 |

---

### Tahap 9 — Test Assignment: Update

**Sub-test:**

| Sub-test | Input | Expected |
|----------|-------|----------|
| Update berhasil | title baru + rubric baru + attachment baru | 200 |
| Assignment tidak ada | ID random | 404 |
| Token MAHASISWA | role=MAHASISWA | 403 |

---

### Tahap 10 — Validasi Keamanan File Upload

Test ini bisa diletakkan di salah satu test file (material atau assignment).

| Sub-test | Endpoint | Input | Expected |
|----------|----------|-------|----------|
| Upload `.php` | POST `/media/materials` | file `shell.php` | 400 |
| Upload `.exe` | POST `/media/materials` | file `malware.exe` | 400 |
| Upload `.sh` | POST `/media/assignments` | file `script.sh` | 400 |
| Upload `.pdf` valid | POST `/media/materials` | `dummy/test_material.pdf` | 200 |
| Upload `.mp4` valid | POST `/media/assignments` | `dummy/test_video.mp4` | 200 |

---

## Referensi

- Panduan testing Gin: https://gin-gonic.com/id/docs/testing/
- Setup test existing: `main_auth_test.go:23-89`
- `handleError()` / `bindJSONError()`: `controllers/auth_controller.go:22-45`
- Material routes: `router/api.go:80-84`
- Assignment routes: `router/api.go:86-90`
- Material controller: `controllers/material_controller.go`
- Assignment controller: `controllers/assignment_controller.go`
- Material service: `services/material_service.go`
- Assignment service: `services/assignment_service.go`
- Media routes: `router/api.go:97-120`
- Media service: `services/media_service.go`
- Auth middleware: `middleware/auth.go`
- ACL middleware: `middleware/acl.go`
- JWT: `lib/jwt.go` — `lib.CreateToken(fullname, email, role, userId)`
- Models: `model/material.go`, `model/assignment.go`, `model/classroom.go`, `model/user.go`, `model/submission.go`
- Dummy files: `dummy/test_material.pdf`, `dummy/test_video.mp4`

---

## File yang Terlibat

| File | Aksi |
|------|------|
| `main_auth_test.go` | Edit — tambah model di `setupTestDB()` + `cleanupDatabase()` |
| `main_material_test.go` | Baru — semua test material |
| `main_assignment_test.go` | Baru — semua test assignment |

---

## Catatan Penting

1. **Material binding:** `ShouldBind` (multipart/form-data). Field `attachments` dikirim sebagai JSON string dalam form field.
2. **Assignment binding:** `ShouldBindJSON` (application/json). Field `attachments` langsung JSON array.
3. **Attachment type validation** dilakukan di service layer (bukan controller). `AttachmentType` harus salah satu dari: `FILE`, `VIDEO`, `LINK`.
4. **Submission otomatis dibuat** saat assignment create (untuk setiap mahasiswa di classroom). Test perlu seed mahasiswa dulu.
5. **Gunakan `t.Parallel()` atau tidak** — karena pakai SQLite in-memory, jangan pakai `t.Parallel()` di sub-test yang share DB yang sama.
