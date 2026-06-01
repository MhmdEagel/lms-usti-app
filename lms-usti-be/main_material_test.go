package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/MhmdEagel/lms-usti-be/controllers"
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/middleware"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func seedMahasiswaToClassroom(db *gorm.DB, user model.User, classroom model.Classroom) {
	result := db.Create(&model.ClassroomMahasiswa{UserId: user.ID, ClassroomId: classroom.ID})
	if result.Error != nil {
		panic("failed to seed classroom mahasiswa: " + result.Error.Error())
	}
}

func loginAndGetToken(r *gin.Engine, email, password string) string {
	body := fmt.Sprintf(`{"email":"%s","password":"%s"}`, email, password)
	w := makeRequest(r, "POST", "/lms-usti-api/auth/login", body, "")
	var res struct {
		Data json.RawMessage `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &res)
	if res.Data == nil {
		return ""
	}
	var tokenData struct {
		AccessToken string `json:"access_token"`
	}
	json.Unmarshal(res.Data, &tokenData)
	return tokenData.AccessToken
}

func makeMultipartFormRequest(r *gin.Engine, method, url string, fields map[string]string, fileFieldName, filePath, token string) (*httptest.ResponseRecorder, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	for k, v := range fields {
		writer.WriteField(k, v)
	}

	if filePath != "" {
		part, err := writer.CreateFormFile(fileFieldName, filepath.Base(filePath))
		if err != nil {
			return nil, err
		}
		f, err := os.Open(filePath)
		if err != nil {
			return nil, err
		}
		defer f.Close()
		io.Copy(part, f)
	}

	writer.Close()
	req := httptest.NewRequest(method, url, body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w, nil
}



type uploadResult struct {
	FileName       string `json:"file_name"`
	UniqueFileName string `json:"unique_file_name"`
	FileUrl        string `json:"file_url"`
}

func uploadFileAndGetResult(r *gin.Engine, url, filePath, token string) (uploadResult, error) {
	w, err := makeMultipartFormRequest(r, "POST", url, nil, "file", filePath, token)
	if err != nil {
		return uploadResult{}, err
	}
	var res struct {
		Data uploadResult `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
		return uploadResult{}, err
	}
	return res.Data, nil
}

func createMaterialRequestJSON(title, description string, attachments []data.AttachmentRequest) string {
	if attachments == nil {
		attachments = []data.AttachmentRequest{}
	}
	req := map[string]any{
		"Title":       title,
		"Description": description,
		"Attachments": attachments,
	}
	b, _ := json.Marshal(req)
	return string(b)
}

func createMaterialUpdateRequestJSON(title, description string, attachments []data.AttachmentRequest) string {
	if attachments == nil {
		attachments = []data.AttachmentRequest{}
	}
	req := map[string]any{
		"Title":       title,
		"Description": description,
		"Attachments": attachments,
	}
	b, _ := json.Marshal(req)
	return string(b)
}

func setupMaterialTestRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.MaxMultipartMemory = 8 << 20

	authMiddleware := middleware.NewAuthMiddleware()
	aclMiddleware := middleware.NewAclMiddleware()
	globalErrMiddleware := middleware.NewGlobalErrMiddleware()
	r.Use(globalErrMiddleware.Handle())

	userRepo := repositories.NewUserRepository(db)
	verificationRepo := repositories.NewVerificationRepository(db)
	classroomRepo := repositories.NewClassroomRepository(db)
	materialRepo := repositories.NewMaterialRepository(db)
	assignmentRepo := repositories.NewAssignmentRepository(db)
	submissionRepo := repositories.NewSubmissionRepository(db)

	authService := services.NewAuthService(userRepo, verificationRepo)
	submissionService := services.NewSubmissionService(submissionRepo, assignmentRepo)
	assignmentService := services.NewAssignmentService(assignmentRepo, classroomRepo, submissionService)
	classroomService := services.NewClassroomService(classroomRepo, submissionService, assignmentService)
	materialService := services.NewMaterialService(materialRepo, classroomRepo)
	mediaService := services.NewMediaService()

	authController := controllers.NewAuthController(authService)
	classroomController := controllers.NewClassroomController(classroomService)
	materialController := controllers.NewMaterialController(materialService)
	mediaController := controllers.NewMediaController(mediaService)

	api := r.Group("/lms-usti-api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", authController.Login)
			auth.POST("/register", authController.Register)
		}
		classroom := api.Group("/classroom")
		classroom.Use(authMiddleware.Handle())
		{
			classroom.POST("/create", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Create)
			classroom.GET("/dosen/classrooms", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.FindAllByDosenId)
			classroom.GET("/mahasiswa/classrooms", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.FindAllByMahasiswaId)
			classroom.POST("/join", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.Enroll)
			classroom.GET("/:id", classroomController.FindById)
			classroom.GET("/:id/members", classroomController.FindAllClassroomMember)
			classroom.DELETE("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Delete)
			classroom.PUT("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Update)

			classroom.GET("/:id/materials", materialController.FindAll)
			classroom.GET("/:id/materials/:materialId", materialController.FindById)
			classroom.POST("/:id/materials", aclMiddleware.Handle([]string{"DOSEN"}), materialController.Create)
			classroom.PUT("/:id/materials/:materialId", aclMiddleware.Handle([]string{"DOSEN"}), materialController.Update)
			classroom.DELETE("/:id/materials/:materialId", aclMiddleware.Handle([]string{"DOSEN"}), materialController.Delete)
		}
		media := api.Group("/media")
		{
			materials := media.Group("/materials")
			materials.POST("", authMiddleware.Handle(), aclMiddleware.Handle([]string{"DOSEN"}), mediaController.UploadMaterial)
			materials.GET("/:name", mediaController.FindMaterialFile)
			materials.DELETE("/:name", authMiddleware.Handle(), mediaController.RemoveMaterial)

			assignments := media.Group("/assignments")
			assignments.POST("", authMiddleware.Handle(), aclMiddleware.Handle([]string{"DOSEN"}), mediaController.UploadAssignment)
		}
	}
	return r
}

// --- Tahap 3: Test Material Create ---

func TestMaterialCreate(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupMaterialTestRouter(db)

	dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
	dosenToken := createTestToken("DOSEN")
	mahasiswaToken := createTestToken("MAHASISWA")

	t.Run("Create berhasil (tanpa attachment)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMaterialRequestJSON("Materi 1", "Deskripsi materi", nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "material berhasil dibuat" {
			t.Errorf("expected 'material successfully created', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Create berhasil (dengan attachment FILE)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		uploadResult, err := uploadFileAndGetResult(r, "/lms-usti-api/media/materials", filepath.Join(dummyDir, "test_material.pdf"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}
		defer os.Remove(filepath.Join(testStoragePath, "materials", uploadResult.UniqueFileName))

		attachments := []data.AttachmentRequest{
			{Name: "File1", Type: "FILE", Url: uploadResult.FileUrl, UniqueName: uploadResult.UniqueFileName},
		}
		body := createMaterialRequestJSON("Materi dengan File", "Deskripsi", attachments)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "material berhasil dibuat" {
			t.Errorf("expected 'material successfully created', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Create berhasil (dengan attachment LINK)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		attachments := []data.AttachmentRequest{
			{Name: "Link1", Type: "LINK", Url: "https://example.com", UniqueName: ""},
		}
		body := createMaterialRequestJSON("Materi dengan Link", "Deskripsi", attachments)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "material berhasil dibuat" {
			t.Errorf("expected 'material successfully created', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Create berhasil (campur FILE + LINK)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		uploadResult, err := uploadFileAndGetResult(r, "/lms-usti-api/media/materials", filepath.Join(dummyDir, "test_material.pdf"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}
		defer os.Remove(filepath.Join(testStoragePath, "materials", uploadResult.UniqueFileName))

		attachments := []data.AttachmentRequest{
			{Name: "File1", Type: "FILE", Url: uploadResult.FileUrl, UniqueName: uploadResult.UniqueFileName},
			{Name: "Link1", Type: "LINK", Url: "https://example.com/doc", UniqueName: ""},
		}
		body := createMaterialRequestJSON("Materi Campur", "Deskripsi", attachments)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "material berhasil dibuat" {
			t.Errorf("expected 'material successfully created', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Title kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMaterialRequestJSON("", "Deskripsi", nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		body := createMaterialRequestJSON("Materi", "Deskripsi", nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/some-id/materials", body, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		body := createMaterialRequestJSON("Materi", "Deskripsi", nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/some-id/materials", body, mahasiswaToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Classroom tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")

		body := createMaterialRequestJSON("Materi", "Deskripsi", nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/nonexistent-id/materials", body, dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Attachment type invalid", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		attachments := []data.AttachmentRequest{
			{Name: "Bad", Type: "SCRIPT", Url: "https://example.com", UniqueName: ""},
		}
		body := createMaterialRequestJSON("Materi", "Deskripsi", attachments)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("URL link tidak valid", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		attachments := []data.AttachmentRequest{
			{Name: "BadLink", Type: "LINK", Url: "bukan-url", UniqueName: ""},
		}
		body := createMaterialRequestJSON("Materi", "Deskripsi", attachments)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Attachment FILE tanpa unique_name", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		attachments := []data.AttachmentRequest{
			{Name: "NoName", Type: "FILE", Url: "http://example.com/file.pdf", UniqueName: ""},
		}
		body := createMaterialRequestJSON("Materi", "Deskripsi", attachments)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 4: Test Material FindAll, FindById, Delete ---

func TestMaterialFindAll(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupMaterialTestRouter(db)

	t.Run("Ada materials", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMaterialRequestJSON("Materi 1", "Deskripsi", nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, token)
		if w.Code != http.StatusOK {
			t.Fatalf("seed material failed: %s", string(w.Body.Bytes()))
		}

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil semua material" {
			t.Errorf("expected 'success find all materials', got '%s'", res.Meta.Message)
		}
		if res.Data == nil {
			t.Errorf("expected non-nil data")
		}
	})

	t.Run("Kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil semua material" {
			t.Errorf("expected 'success find all materials', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Classroom tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		token := createTestToken("DOSEN")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/nonexistent-id/materials", "", token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

func TestMaterialFindById(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupMaterialTestRouter(db)

	t.Run("Ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMaterialRequestJSON("Materi 1", "Deskripsi", nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, token)
		if w.Code != http.StatusOK {
			t.Fatalf("seed material failed: %s", string(w.Body.Bytes()))
		}
		var createRes struct {
			Data json.RawMessage `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &createRes)

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials", "", token)
		if w.Code != http.StatusOK {
			t.Fatalf("find all failed: %s", string(w.Body.Bytes()))
		}
		var listRes struct {
			Data []struct {
				Id string `json:"id"`
			} `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &listRes)
		if len(listRes.Data) == 0 {
			t.Fatal("no materials found")
		}
		materialId := listRes.Data[0].Id

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+materialId, "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil material" {
			t.Errorf("expected 'success find material by id', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials/nonexistent-id", "", token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

func TestMaterialDelete(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupMaterialTestRouter(db)

	dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
	dosenToken := createTestToken("DOSEN")
	mahasiswaToken := createTestToken("MAHASISWA")

	t.Run("Hapus berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMaterialRequestJSON("Materi 1", "Deskripsi", nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, dosenToken)
		if w.Code != http.StatusOK {
			t.Fatalf("seed material failed: %s", string(w.Body.Bytes()))
		}
		var listRes struct {
			Data []struct {
				Id string `json:"id"`
			} `json:"data"`
		}
		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials", "", dosenToken)
		json.Unmarshal(w.Body.Bytes(), &listRes)
		if len(listRes.Data) == 0 {
			t.Fatal("no materials found")
		}
		materialId := listRes.Data[0].Id

		w = makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+materialId, "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "material berhasil dihapus" {
			t.Errorf("expected 'material successfully deleted', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Material tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/materials/nonexistent-id", "", dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id/materials/some-id", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id/materials/some-id", "", mahasiswaToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 5: Test Material Update ---

func TestMaterialUpdate(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupMaterialTestRouter(db)

	dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
	dosenToken := createTestToken("DOSEN")
	mahasiswaToken := createTestToken("MAHASISWA")

	t.Run("Update berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMaterialRequestJSON("Materi 1", "Deskripsi", nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, dosenToken)
		if w.Code != http.StatusOK {
			t.Fatalf("seed material failed: %s", string(w.Body.Bytes()))
		}
		var listRes struct {
			Data []struct {
				Id string `json:"id"`
			} `json:"data"`
		}
		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials", "", dosenToken)
		json.Unmarshal(w.Body.Bytes(), &listRes)
		if len(listRes.Data) == 0 {
			t.Fatal("no materials found")
		}
		materialId := listRes.Data[0].Id

		updateBody := createMaterialUpdateRequestJSON("Materi Updated", "Deskripsi baru", nil)
		w = makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+materialId, updateBody, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "material berhasil diperbarui" {
			t.Errorf("expected 'material successfully updated', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Ganti attachment", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		uploadResult, err := uploadFileAndGetResult(r, "/lms-usti-api/media/materials", filepath.Join(dummyDir, "test_material.pdf"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}
		defer os.Remove(filepath.Join(testStoragePath, "materials", uploadResult.UniqueFileName))

		attachments := []data.AttachmentRequest{
			{Name: "File1", Type: "FILE", Url: uploadResult.FileUrl, UniqueName: uploadResult.UniqueFileName},
		}
		body := createMaterialRequestJSON("Materi 1", "Deskripsi", attachments)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, dosenToken)
		if w.Code != http.StatusOK {
			t.Fatalf("seed material failed: %s", string(w.Body.Bytes()))
		}
		var listRes struct {
			Data []struct {
				Id string `json:"id"`
			} `json:"data"`
		}
		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials", "", dosenToken)
		json.Unmarshal(w.Body.Bytes(), &listRes)
		if len(listRes.Data) == 0 {
			t.Fatal("no materials found")
		}
		materialId := listRes.Data[0].Id

		newAttachments := []data.AttachmentRequest{
			{Name: "Link1", Type: "LINK", Url: "https://example.com/new", UniqueName: ""},
		}
		updateBody := createMaterialUpdateRequestJSON("Materi Updated", "Deskripsi baru", newAttachments)
		w = makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+materialId, updateBody, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "material berhasil diperbarui" {
			t.Errorf("expected 'material successfully updated', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Material tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		updateBody := createMaterialUpdateRequestJSON("Materi", "Deskripsi", nil)
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/materials/nonexistent-id", updateBody, dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		updateBody := createMaterialUpdateRequestJSON("Materi", "Deskripsi", nil)
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/some-id/materials/some-id", updateBody, mahasiswaToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 10: Security Validation File Upload ---

func TestSecurityUpload(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupMaterialTestRouter(db)

	dosenToken := createTestToken("DOSEN")

	t.Run("Upload .php ditolak", func(t *testing.T) {
		cleanupDatabase(db)
		tmpFile, err := os.CreateTemp("", "*.php")
		if err != nil {
			t.Fatal(err)
		}
		defer os.Remove(tmpFile.Name())
		tmpFile.WriteString("<?php echo 'test';")
		tmpFile.Close()

		w, err := makeMultipartFormRequest(r, "POST", "/lms-usti-api/media/materials", nil, "file", tmpFile.Name(), dosenToken)
		if err != nil {
			t.Fatal(err)
		}
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Upload .exe ditolak", func(t *testing.T) {
		cleanupDatabase(db)
		tmpFile, err := os.CreateTemp("", "*.exe")
		if err != nil {
			t.Fatal(err)
		}
		defer os.Remove(tmpFile.Name())
		tmpFile.WriteString("MZ")
		tmpFile.Close()

		w, err := makeMultipartFormRequest(r, "POST", "/lms-usti-api/media/materials", nil, "file", tmpFile.Name(), dosenToken)
		if err != nil {
			t.Fatal(err)
		}
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Upload .sh ditolak", func(t *testing.T) {
		cleanupDatabase(db)
		tmpFile, err := os.CreateTemp("", "*.sh")
		if err != nil {
			t.Fatal(err)
		}
		defer os.Remove(tmpFile.Name())
		tmpFile.WriteString("#!/bin/bash\necho test")
		tmpFile.Close()

		w, err := makeMultipartFormRequest(r, "POST", "/lms-usti-api/media/assignments", nil, "file", tmpFile.Name(), dosenToken)
		if err != nil {
			t.Fatal(err)
		}
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Upload .pdf diterima", func(t *testing.T) {
		cleanupDatabase(db)
		dummyPath := filepath.Join(dummyDir, "test_material.pdf")
		result, err := uploadFileAndGetResult(r, "/lms-usti-api/media/materials", dummyPath, dosenToken)
		if err != nil {
			t.Fatalf("expected success, got error: %v", err)
		}
		if result.UniqueFileName == "" {
			t.Error("expected non-empty unique_file_name")
		}
	})

	t.Run("Upload .mp4 diterima", func(t *testing.T) {
		cleanupDatabase(db)
		dummyPath := filepath.Join(dummyDir, "test_video.mp4")
		w, err := makeMultipartFormRequest(r, "POST", "/lms-usti-api/media/assignments", nil, "file", dummyPath, dosenToken)
		if err != nil {
			t.Fatal(err)
		}
		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}
