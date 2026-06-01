package main

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

func seedMaterial(db *gorm.DB, classroomId, title string) model.Material {
	material := model.Material{
		Title:       title,
		Description: "Deskripsi materi",
		ClassroomId: classroomId,
	}
	result := db.Create(&material)
	if result.Error != nil {
		panic("failed to seed material: " + result.Error.Error())
	}
	return material
}

// --- Tahap 2: Test Create Material ---

func TestCreateMaterial(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Create berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		token := generateToken(dosen)

		params := map[string]string{
			"title":       "Materi Aljabar",
			"description": "Belajar aljabar linear",
		}
		w := makeFormRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", params, token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "material successfully created" {
			t.Errorf("expected 'material successfully created', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Create dengan title kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		token := generateToken(dosen)

		params := map[string]string{
			"title": "",
		}
		w := makeFormRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", params, token)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Create tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		params := map[string]string{
			"title":       "Materi Aljabar",
			"description": "Belajar aljabar linear",
		}
		w := makeFormRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", params, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Create dengan token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mahasiswa := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		classroom := seedClassroom(db, mahasiswa.ID, "Matematika Dasar")
		token := generateToken(mahasiswa)

		params := map[string]string{
			"title":       "Materi Aljabar",
			"description": "Belajar aljabar linear",
		}
		w := makeFormRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", params, token)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Create dengan classroomId tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)

		params := map[string]string{
			"title":       "Materi Aljabar",
			"description": "Belajar aljabar linear",
		}
		w := makeFormRequest(r, "POST", "/lms-usti-api/classroom/nonexistent-id/materials", params, token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 3: Test FindAll Material ---

func TestFindAllMaterial(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("FindAll berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		seedMaterial(db, classroom.ID, "Materi Aljabar")
		seedMaterial(db, classroom.ID, "Materi Geometri")
		token := generateToken(dosen)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var materials []data.MaterialResponse
		json.Unmarshal(res.Data, &materials)
		if len(materials) != 2 {
			t.Errorf("expected 2 materials, got %d", len(materials))
		}
	})

	t.Run("FindAll classroom kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		token := generateToken(dosen)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var materials []data.MaterialResponse
		json.Unmarshal(res.Data, &materials)
		if len(materials) != 0 {
			t.Errorf("expected 0 materials, got %d", len(materials))
		}
	})

	t.Run("FindAll dengan classroomId tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/nonexistent-id/materials", "", token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("FindAll tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 4: Test FindById Material ---

func TestFindMaterialById(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("FindById berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		material := seedMaterial(db, classroom.ID, "Materi Aljabar")

		link := model.MaterialLink{
			LinkName:   "Referensi",
			LinkUrl:    "https://example.com/ref",
			MaterialId: material.ID,
		}
		db.Create(&link)
		file := model.MaterialFile{
			FileName:       "dokumen.pdf",
			UniqueFileName: "unique-dokumen.pdf",
			FileUrl:        "https://storage.example.com/unique-dokumen.pdf",
			MaterialId:     material.ID,
		}
		db.Create(&file)

		token := generateToken(dosen)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+material.ID, "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var detail data.MaterialDetailResponse
		json.Unmarshal(res.Data, &detail)
		if detail.Id != material.ID {
			t.Errorf("expected material id %s, got %s", material.ID, detail.Id)
		}
		if len(detail.Files) != 1 {
			t.Errorf("expected 1 file, got %d", len(detail.Files))
		}
		if len(detail.Links) != 1 {
			t.Errorf("expected 1 link, got %d", len(detail.Links))
		}
	})

	t.Run("FindById dengan materialId tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		token := generateToken(dosen)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials/nonexistent-id", "", token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("FindById dengan classroomId berbeda", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroomA := seedClassroom(db, dosen.ID, "Kelas A")
		classroomB := seedClassroom(db, dosen.ID, "Kelas B")
		material := seedMaterial(db, classroomA.ID, "Materi Milik Kelas A")
		token := generateToken(dosen)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroomB.ID+"/materials/"+material.ID, "", token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("FindById tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		material := seedMaterial(db, classroom.ID, "Materi Aljabar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+material.ID, "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 5: Test Update Material ---

func TestUpdateMaterial(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Update berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		material := seedMaterial(db, classroom.ID, "Materi Aljabar")
		token := generateToken(dosen)

		params := map[string]string{
			"title":       "Materi Aljabar Updated",
			"description": "Deskripsi updated",
		}
		w := makeFormRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+material.ID, params, token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "material successfully updated" {
			t.Errorf("expected 'material successfully updated', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Update title dan description", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		material := seedMaterial(db, classroom.ID, "Judul Lama")
		token := generateToken(dosen)

		params := map[string]string{
			"title":       "Judul Baru",
			"description": "Deskripsi baru",
		}
		w := makeFormRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+material.ID, params, token)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}

		var updated model.Material
		db.First(&updated, "id = ?", material.ID)
		if updated.Title != "Judul Baru" {
			t.Errorf("expected title 'Judul Baru', got '%s'", updated.Title)
		}
		if updated.Description != "Deskripsi baru" {
			t.Errorf("expected description 'Deskripsi baru', got '%s'", updated.Description)
		}
	})

	t.Run("Update dengan materialId tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		token := generateToken(dosen)

		params := map[string]string{
			"title":       "Judul Baru",
			"description": "Deskripsi baru",
		}
		w := makeFormRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/materials/nonexistent-id", params, token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Update tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		material := seedMaterial(db, classroom.ID, "Materi Aljabar")

		params := map[string]string{
			"title":       "Judul Baru",
			"description": "Deskripsi baru",
		}
		w := makeFormRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+material.ID, params, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Update dengan token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mahasiswa := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		material := seedMaterial(db, classroom.ID, "Materi Aljabar")
		token := generateToken(mahasiswa)

		params := map[string]string{
			"title":       "Judul Baru",
			"description": "Deskripsi baru",
		}
		w := makeFormRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+material.ID, params, token)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 6: Test Delete Material ---

func TestDeleteMaterial(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Delete berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		material := seedMaterial(db, classroom.ID, "Materi Aljabar")
		token := generateToken(dosen)

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+material.ID, "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "material successfully deleted" {
			t.Errorf("expected 'material successfully deleted', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Delete dengan materialId tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		token := generateToken(dosen)

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/materials/nonexistent-id", "", token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Delete tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		material := seedMaterial(db, classroom.ID, "Materi Aljabar")

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+material.ID, "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Delete dengan token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mahasiswa := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		material := seedMaterial(db, classroom.ID, "Materi Aljabar")
		token := generateToken(mahasiswa)

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+material.ID, "", token)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}
