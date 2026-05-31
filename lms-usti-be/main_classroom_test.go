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

func seedClassroom(db *gorm.DB, dosenId, className string) model.Classroom {
	classroom := model.Classroom{
		ClassCover: "https://example.com/cover.jpg",
		ClassName:  className,
		Term:       1,
		RoomNumber: 101,
		Day:        2,
		ClassStart: time.Date(2026, 1, 1, 8, 0, 0, 0, time.UTC),
		ClassEnd:   time.Date(2026, 1, 1, 10, 0, 0, 0, time.UTC),
		DosenId:    dosenId,
	}
	result := db.Create(&classroom)
	if result.Error != nil {
		panic("failed to seed classroom: " + result.Error.Error())
	}
	return classroom
}

func generateToken(user model.User) string {
	token, err := lib.CreateToken(user.Fullname, user.Email, user.Role, user.ID)
	if err != nil {
		panic("failed to create token: " + err.Error())
	}
	return token
}

// --- Tahap 2: Test Create Classroom ---

func TestCreateClassroom(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Create berhasil (DOSEN)", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(user)

		body := `{"class_name":"Matematika Dasar","class_cover":"https://example.com/cover.jpg","term":1,"room_number":101,"day":2,"class_start":"2026-01-01T08:00:00Z","class_end":"2026-01-01T10:00:00Z"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/create", body, token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "successfully create classroom" {
			t.Errorf("expected 'successfully create classroom', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Create dengan body kosong", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(user)

		body := `{}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/create", body, token)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Create dengan class_name < 8 karakter", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(user)

		body := `{"class_name":"Singkat","class_cover":"https://example.com/cover.jpg","term":1,"room_number":101,"day":2,"class_start":"2026-01-01T08:00:00Z","class_end":"2026-01-01T10:00:00Z"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/create", body, token)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Create tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{"class_name":"Matematika Dasar","class_cover":"https://example.com/cover.jpg","term":1,"room_number":101,"day":2,"class_start":"2026-01-01T08:00:00Z","class_end":"2026-01-01T10:00:00Z"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/create", body, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Create dengan token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		token := generateToken(user)

		body := `{"class_name":"Matematika Dasar","class_cover":"https://example.com/cover.jpg","term":1,"room_number":101,"day":2,"class_start":"2026-01-01T08:00:00Z","class_end":"2026-01-01T10:00:00Z"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/create", body, token)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 3: Test FindAllByDosenId ---

func TestFindAllByDosenId(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Find berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/dosen/classrooms", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "successfully find all dosen classrooms" {
			t.Errorf("expected 'successfully find all dosen classrooms', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Find tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "GET", "/lms-usti-api/classroom/dosen/classrooms", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Find dengan token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		token := generateToken(user)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/dosen/classrooms", "", token)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Pagination: page 1, limit 2", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		seedClassroom(db, dosen.ID, "Kelas A")
		seedClassroom(db, dosen.ID, "Kelas B")
		seedClassroom(db, dosen.ID, "Kelas C")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/dosen/classrooms?page=1&limit=2", "", token)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var res struct {
			Pagination struct {
				Total      int `json:"total"`
				TotalPages int `json:"total_pages"`
			} `json:"pagination"`
			Data []any `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &res)
		if res.Pagination.Total != 3 {
			t.Errorf("expected total 3, got %d", res.Pagination.Total)
		}
		if res.Pagination.TotalPages != 2 {
			t.Errorf("expected total_pages 2, got %d", res.Pagination.TotalPages)
		}
		if len(res.Data) != 2 {
			t.Errorf("expected 2 items, got %d", len(res.Data))
		}
	})

	t.Run("Pagination: page 2, limit 2", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		seedClassroom(db, dosen.ID, "Kelas A")
		seedClassroom(db, dosen.ID, "Kelas B")
		seedClassroom(db, dosen.ID, "Kelas C")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/dosen/classrooms?page=2&limit=2", "", token)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var res struct {
			Data []any `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &res)
		if len(res.Data) != 1 {
			t.Errorf("expected 1 item, got %d", len(res.Data))
		}
	})

	t.Run("Pagination: page melebihi total", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		seedClassroom(db, dosen.ID, "Kelas A")
		seedClassroom(db, dosen.ID, "Kelas B")
		seedClassroom(db, dosen.ID, "Kelas C")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/dosen/classrooms?page=10&limit=2", "", token)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var res struct {
			Data []any `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &res)
		if len(res.Data) != 0 {
			t.Errorf("expected empty data, got %d items", len(res.Data))
		}
	})
}

// --- Tahap 4: Test FindAllByMahasiswaId ---

func TestFindAllByMahasiswaId(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Find berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		token := generateToken(mhs)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: classroom.ID})

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/mahasiswa/classrooms", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "successfully find all mahasiswa classrooms" {
			t.Errorf("expected 'successfully find all mahasiswa classrooms', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Find tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "GET", "/lms-usti-api/classroom/mahasiswa/classrooms", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Find dengan token DOSEN", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(user)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/mahasiswa/classrooms", "", token)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Pagination: page 1, limit 2", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		token := generateToken(mhs)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		c1 := seedClassroom(db, dosen.ID, "Kelas A")
		c2 := seedClassroom(db, dosen.ID, "Kelas B")
		c3 := seedClassroom(db, dosen.ID, "Kelas C")
		db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: c1.ID})
		db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: c2.ID})
		db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: c3.ID})

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/mahasiswa/classrooms?page=1&limit=2", "", token)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var res struct {
			Pagination struct {
				Total      int `json:"total"`
				TotalPages int `json:"total_pages"`
			} `json:"pagination"`
			Data []any `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &res)
		if res.Pagination.Total != 3 {
			t.Errorf("expected total 3, got %d", res.Pagination.Total)
		}
		if res.Pagination.TotalPages != 2 {
			t.Errorf("expected total_pages 2, got %d", res.Pagination.TotalPages)
		}
		if len(res.Data) != 2 {
			t.Errorf("expected 2 items, got %d", len(res.Data))
		}
	})

	t.Run("Pagination: page 2, limit 2", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		token := generateToken(mhs)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		c1 := seedClassroom(db, dosen.ID, "Kelas A")
		c2 := seedClassroom(db, dosen.ID, "Kelas B")
		c3 := seedClassroom(db, dosen.ID, "Kelas C")
		db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: c1.ID})
		db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: c2.ID})
		db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: c3.ID})

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/mahasiswa/classrooms?page=2&limit=2", "", token)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var res struct {
			Data []any `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &res)
		if len(res.Data) != 1 {
			t.Errorf("expected 1 item, got %d", len(res.Data))
		}
	})

	t.Run("Pagination: tanpa query param", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		token := generateToken(mhs)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		c1 := seedClassroom(db, dosen.ID, "Kelas A")
		c2 := seedClassroom(db, dosen.ID, "Kelas B")
		c3 := seedClassroom(db, dosen.ID, "Kelas C")
		db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: c1.ID})
		db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: c2.ID})
		db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: c3.ID})

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/mahasiswa/classrooms", "", token)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var res struct {
			Pagination struct {
				Limit   int `json:"limit"`
				Current int `json:"current"`
			} `json:"pagination"`
			Data []any `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &res)
		if res.Pagination.Limit != 10 {
			t.Errorf("expected default limit 10, got %d", res.Pagination.Limit)
		}
		if res.Pagination.Current != 1 {
			t.Errorf("expected default current 1, got %d", res.Pagination.Current)
		}
		if len(res.Data) != 3 {
			t.Errorf("expected 3 items, got %d", len(res.Data))
		}
	})
}

// --- Tahap 5: Test Find Classroom By Id ---

func TestFindClassroomById(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Find berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID, "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "success find classroom by id" {
			t.Errorf("expected 'success find classroom by id', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Find dengan ID tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(user)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/nonexistent-id", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "classroom not found" {
			t.Errorf("expected 'classroom not found', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Find tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "GET", "/lms-usti-api/classroom/some-id", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 6: Test Update Classroom ---

func TestUpdateClassroom(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Update berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := `{"class_name":"Fisika Lanjutan","room_number":202}`
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID, body, token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "classroom successfully updated" {
			t.Errorf("expected 'classroom successfully updated', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Partial update — field lain tidak berubah", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		originalCode := classroom.ClassCode

		body := `{"class_name":"Fisika Lanjutan"}`
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID, body, token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "classroom successfully updated" {
			t.Errorf("expected 'classroom successfully updated', got '%s'", res.Meta.Message)
		}
		var updated model.Classroom
		db.First(&updated, "id = ?", classroom.ID)
		if updated.ClassName != "Fisika Lanjutan" {
			t.Errorf("expected class_name 'Fisika Lanjutan', got '%s'", updated.ClassName)
		}
		if updated.ClassCode != originalCode {
			t.Errorf("class_code should not change on update")
		}
		if updated.RoomNumber != 101 {
			t.Errorf("room_number should remain 101, got %d", updated.RoomNumber)
		}
	})

	t.Run("Update dengan ID tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(user)

		body := `{"class_name":"Fisika Lanjutan"}`
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/nonexistent-id", body, token)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "classroom not found" {
			t.Errorf("expected 'classroom not found', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Update tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{"class_name":"Fisika Lanjutan"}`
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/some-id", body, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Update dengan token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		token := generateToken(user)

		body := `{"class_name":"Fisika Lanjutan"}`
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/some-id", body, token)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 7: Test Delete Classroom ---

func TestDeleteClassroom(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Delete berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID, "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "classroom successfully deleted" {
			t.Errorf("expected 'classroom successfully deleted', got '%s'", res.Meta.Message)
		}
		var count int64
		db.Model(&model.Classroom{}).Where("id = ?", classroom.ID).Count(&count)
		if count != 0 {
			t.Errorf("expected classroom to be deleted")
		}
	})

	t.Run("Delete dengan ID tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(user)

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/nonexistent-id", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "classroom not found" {
			t.Errorf("expected 'classroom not found', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Delete dengan dosenId berbeda", func(t *testing.T) {
		cleanupDatabase(db)
		dosenA := seedUser(db, "Dosen A", "dosenA@test.com", "password123", "DOSEN")
		dosenB := seedUser(db, "Dosen B", "dosenB@test.com", "password123", "DOSEN")
		tokenB := generateToken(dosenB)
		classroom := seedClassroom(db, dosenA.ID, "Matematika Dasar")

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID, "", tokenB)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "classroom not found" {
			t.Errorf("expected 'classroom not found', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Delete tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Delete dengan token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		token := generateToken(user)

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id", "", token)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 8: Test Enroll Classroom ---

func TestEnrollClassroom(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Enroll berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		token := generateToken(mhs)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := `{"class_code":"` + classroom.ClassCode + `"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/join", body, token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "success join classroom" {
			t.Errorf("expected 'success join classroom', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Enroll dengan class_code tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		token := generateToken(mhs)

		body := `{"class_code":"KLS-XXXXX"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/join", body, token)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "kelas tidak ditemukan" {
			t.Errorf("expected 'kelas tidak ditemukan', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Enroll dua kali", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		token := generateToken(mhs)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := `{"class_code":"` + classroom.ClassCode + `"}`
		w1 := makeRequest(r, "POST", "/lms-usti-api/classroom/join", body, token)
		if w1.Code != http.StatusOK {
			t.Errorf("first enroll: expected 200, got %d: %s", w1.Code, string(w1.Body.Bytes()))
		}

		w2 := makeRequest(r, "POST", "/lms-usti-api/classroom/join", body, token)
		res2 := parseResponse(w2)
		if w2.Code != http.StatusConflict {
			t.Errorf("second enroll: expected 409, got %d: %s", w2.Code, string(w2.Body.Bytes()))
		}
		if res2.Meta.Message != "sudah bergabung di kelas ini" {
			t.Errorf("expected 'sudah bergabung di kelas ini', got '%s'", res2.Meta.Message)
		}
	})

	t.Run("Enroll tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{"class_code":"KLS-XXXXX"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/join", body, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Enroll dengan token DOSEN", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(user)

		body := `{"class_code":"KLS-XXXXX"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/join", body, token)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 9: Test FindAllClassroomMember ---

func TestFindAllClassroomMember(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Find berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		db.Create(&model.ClassroomMahasiswa{UserId: mhs.ID, ClassroomId: classroom.ID})

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/members", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "success find all classroom member" {
			t.Errorf("expected 'success find all classroom member', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Find dengan classroomId tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(user)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/nonexistent-id/members", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "classroom not found" {
			t.Errorf("expected 'classroom not found', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Find tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "GET", "/lms-usti-api/classroom/some-id/members", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}
