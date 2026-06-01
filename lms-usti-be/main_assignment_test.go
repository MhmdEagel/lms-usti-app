package main

import (
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

func seedAssignment(db *gorm.DB, classroomId, title string) model.Assignment {
	assignment := model.Assignment{
		Title:       title,
		Deadline:    time.Date(2026, 12, 31, 23, 59, 0, 0, time.UTC),
		Instruction: "Test Instruction",
		ClassroomId: classroomId,
	}
	result := db.Create(&assignment)
	if result.Error != nil {
		panic("failed to seed assignment: " + result.Error.Error())
	}
	return assignment
}

// --- Tahap 2: Test Create Assignment ---

func TestCreateAssignment(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Create berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		body := `{"title":"Tugas 1","deadline":"2026-12-31T23:59:00Z","instruction":"Kerjakan dengan baik"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil dibuat" {
			t.Errorf("expected 'assignment berhasil dibuat', got '%s'", res.Meta.Message)
		}
		var count int64
		db.Model(&model.Assignment{}).Where("classroom_id = ?", classroom.ID).Count(&count)
		if count != 1 {
			t.Errorf("expected 1 assignment in DB, got %d", count)
		}
	})

	t.Run("Create dengan title kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		body := `{"title":"","deadline":"2026-12-31T23:59:00Z","instruction":"Test"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, token)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Create dengan deadline kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		body := `{"title":"Tugas 1","deadline":"","instruction":"Test"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, token)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Create tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")

		body := `{"title":"Tugas 1","deadline":"2026-12-31T23:59:00Z","instruction":"Test"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, "")

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Create dengan token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mahasiswa", "mhs@test.com", "password123", "MAHASISWA")
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		token, _ := lib.CreateToken(mhs.Fullname, mhs.Email, mhs.Role, mhs.ID)

		body := `{"title":"Tugas 1","deadline":"2026-12-31T23:59:00Z","instruction":"Test"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, token)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Create dengan classroomId tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		body := `{"title":"Tugas 1","deadline":"2026-12-31T23:59:00Z","instruction":"Test"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/nonexistent-id/assignments", body, token)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "kelas tidak ditemukan" {
			t.Errorf("expected 'kelas tidak ditemukan', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Create dengan rubrics", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		body := `{"title":"Tugas 1","deadline":"2026-12-31T23:59:00Z","instruction":"Kerjakan","rubrics":[{"name":"Kebersihan","score":50},{"name":"Ketepatan","score":50}]}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil dibuat" {
			t.Errorf("expected 'assignment berhasil dibuat', got '%s'", res.Meta.Message)
		}
		var rubricCount int64
		db.Model(&model.AssignmentRubric{}).Count(&rubricCount)
		if rubricCount != 2 {
			t.Errorf("expected 2 rubrics in DB, got %d", rubricCount)
		}
	})
}

// --- Tahap 3: Test FindAll Assignment ---

func TestFindAllAssignment(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("FindAll berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		seedAssignment(db, classroom.ID, "Tugas 1")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil semua assignment" {
			t.Errorf("expected 'berhasil mengambil semua assignment', got '%s'", res.Meta.Message)
		}
	})

	t.Run("FindAll classroom kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if string(res.Data) != "[]" {
			t.Errorf("expected empty array, got %s", string(res.Data))
		}
	})

	t.Run("FindAll dengan classroomId tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/nonexistent-id/assignments", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "kelas tidak ditemukan" {
			t.Errorf("expected 'kelas tidak ditemukan', got '%s'", res.Meta.Message)
		}
	})

	t.Run("FindAll tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", "", "")

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("FindAll dengan multiple assignments", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		seedAssignment(db, classroom.ID, "Tugas 1")
		seedAssignment(db, classroom.ID, "Tugas 2")
		seedAssignment(db, classroom.ID, "Tugas 3")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil semua assignment" {
			t.Errorf("expected 'berhasil mengambil semua assignment', got '%s'", res.Meta.Message)
		}
		var assignments []map[string]any
		json.Unmarshal(res.Data, &assignments)
		if len(assignments) != 3 {
			t.Errorf("expected 3 assignments, got %d", len(assignments))
		}
	})
}

// --- Tahap 4: Test FindById Assignment ---

func TestFindAssignmentById(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("FindById berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		assignment := seedAssignment(db, classroom.ID, "Tugas 1")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignment.ID, "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil assignment" {
			t.Errorf("expected 'berhasil mengambil assignment', got '%s'", res.Meta.Message)
		}
	})

	t.Run("FindById dengan assignmentId tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/nonexistent-id", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment tidak ditemukan" {
			t.Errorf("expected 'assignment tidak ditemukan', got '%s'", res.Meta.Message)
		}
	})

	t.Run("FindById dengan classroomId berbeda", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom1 := seedClassroom(db, dosen.ID, "Class 1")
		classroom2 := seedClassroom(db, dosen.ID, "Class 2")
		assignment := seedAssignment(db, classroom1.ID, "Tugas 1")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom2.ID+"/assignments/"+assignment.ID, "", token)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment tidak ditemukan" {
			t.Errorf("expected 'assignment tidak ditemukan', got '%s'", res.Meta.Message)
		}
	})

	t.Run("FindById tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		assignment := seedAssignment(db, classroom.ID, "Tugas 1")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignment.ID, "", "")

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 5: Test Update Assignment ---

func TestUpdateAssignment(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Update berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		assignment := seedAssignment(db, classroom.ID, "Tugas 1")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		body := `{"title":"Tugas Updated","deadline":"2026-12-31T23:59:00Z","instruction":"Updated instruction"}`
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignment.ID, body, token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil diperbarui" {
			t.Errorf("expected 'assignment berhasil diperbarui', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Update hanya title (partial update)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		assignment := seedAssignment(db, classroom.ID, "Tugas 1")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		body := `{"title":"Tugas Baru"}`
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignment.ID, body, token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil diperbarui" {
			t.Errorf("expected 'assignment berhasil diperbarui', got '%s'", res.Meta.Message)
		}
		var updated model.Assignment
		db.First(&updated, "id = ?", assignment.ID)
		if updated.Title != "Tugas Baru" {
			t.Errorf("expected title 'Tugas Baru', got '%s'", updated.Title)
		}
		if updated.Instruction != "Test Instruction" {
			t.Errorf("expected instruction unchanged 'Test Instruction', got '%s'", updated.Instruction)
		}
	})

	t.Run("Update dengan assignmentId tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		body := `{"title":"Tugas Baru","deadline":"2026-12-31T23:59:00Z"}`
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/nonexistent-id", body, token)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment tidak ditemukan" {
			t.Errorf("expected 'assignment tidak ditemukan', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Update tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		assignment := seedAssignment(db, classroom.ID, "Tugas 1")

		body := `{"title":"Tugas Baru"}`
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignment.ID, body, "")

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Update dengan token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mahasiswa", "mhs@test.com", "password123", "MAHASISWA")
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		assignment := seedAssignment(db, classroom.ID, "Tugas 1")
		token, _ := lib.CreateToken(mhs.Fullname, mhs.Email, mhs.Role, mhs.ID)

		body := `{"title":"Tugas Baru"}`
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignment.ID, body, token)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Update rubrics", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		assignment := seedAssignment(db, classroom.ID, "Tugas 1")

		db.Create(&model.AssignmentRubric{Name: "Rubrik Lama", Score: 100, AssignmentId: assignment.ID})

		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		body := `{"title":"Tugas 1","deadline":"2026-12-31T23:59:00Z","rubrics":[{"name":"Rubrik Baru","score":80}]}`
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignment.ID, body, token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil diperbarui" {
			t.Errorf("expected 'assignment berhasil diperbarui', got '%s'", res.Meta.Message)
		}

		var rubricCount int64
		db.Model(&model.AssignmentRubric{}).Where("assignment_id = ?", assignment.ID).Count(&rubricCount)
		if rubricCount != 1 {
			t.Errorf("expected 1 rubric after update, got %d", rubricCount)
		}
		var rubric model.AssignmentRubric
		db.Where("assignment_id = ?", assignment.ID).First(&rubric)
		if rubric.Name != "Rubrik Baru" {
			t.Errorf("expected rubric name 'Rubrik Baru', got '%s'", rubric.Name)
		}
	})
}

// --- Tahap 6: Test Delete Assignment ---

func TestDeleteAssignment(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Delete berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		assignment := seedAssignment(db, classroom.ID, "Tugas 1")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignment.ID, "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil dihapus" {
			t.Errorf("expected 'assignment berhasil dihapus', got '%s'", res.Meta.Message)
		}
		var count int64
		db.Model(&model.Assignment{}).Where("id = ?", assignment.ID).Count(&count)
		if count != 0 {
			t.Errorf("expected assignment to be deleted, count: %d", count)
		}
	})

	t.Run("Delete dengan assignmentId tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		token, _ := lib.CreateToken(dosen.Fullname, dosen.Email, dosen.Role, dosen.ID)

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/nonexistent-id", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment tidak ditemukan" {
			t.Errorf("expected 'assignment tidak ditemukan', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Delete tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		assignment := seedAssignment(db, classroom.ID, "Tugas 1")

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignment.ID, "", "")

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Delete dengan token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mahasiswa", "mhs@test.com", "password123", "MAHASISWA")
		dosen := seedUser(db, "Dosen", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Test Class")
		assignment := seedAssignment(db, classroom.ID, "Tugas 1")
		token, _ := lib.CreateToken(mhs.Fullname, mhs.Email, mhs.Role, mhs.ID)

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignment.ID, "", token)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}
