package main

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/MhmdEagel/lms-usti-be/controllers"
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/middleware"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupAssignmentTestRouter(db *gorm.DB) *gin.Engine {
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
	assignmentRepo := repositories.NewAssignmentRepository(db)
	submissionRepo := repositories.NewSubmissionRepository(db)
	contentViewRepo := repositories.NewContentViewRepository(db)

	authService := services.NewAuthService(userRepo, verificationRepo)
	submissionService := services.NewSubmissionService(submissionRepo, assignmentRepo)
	assignmentService := services.NewAssignmentService(assignmentRepo, classroomRepo, submissionService, contentViewRepo)
	classroomPolicyRepo := repositories.NewClassroomPolicyRepository(db)
	classroomService := services.NewClassroomService(classroomRepo, submissionService, assignmentService, classroomPolicyRepo)
	mediaService := services.NewMediaService()

	authController := controllers.NewAuthController(authService)
	classroomController := controllers.NewClassroomController(classroomService)
	assignmentController := controllers.NewAssignmentController(assignmentService)
	mediaController := controllers.NewMediaController(mediaService)

	api := r.Group("/lms-usti-api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", authController.Login)
		}
		classroom := api.Group("/classroom")
		classroom.Use(authMiddleware.Handle())
		{
			classroom.POST("/create", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Create)
			classroom.POST("/join", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.Enroll)
			classroom.GET("/:id", classroomController.FindById)
			classroom.GET("/:id/members", classroomController.FindAllClassroomMember)
			classroom.DELETE("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Delete)
			classroom.PUT("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Update)

			classroom.GET("/:id/assignments", assignmentController.FindAll)
			classroom.GET("/:id/assignments/:assignmentId", assignmentController.FindById)
			classroom.POST("/:id/assignments", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Create)
			classroom.PUT("/:id/assignments/:assignmentId", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Update)
			classroom.DELETE("/:id/assignments/:assignmentId", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Delete)
		}
		media := api.Group("/media")
		{
			assignments := media.Group("/assignments")
			assignments.POST("", authMiddleware.Handle(), aclMiddleware.Handle([]string{"DOSEN"}), mediaController.UploadAssignment)
			assignments.GET("/:name", mediaController.FindAssignmentFile)
			assignments.DELETE("/:name", authMiddleware.Handle(), mediaController.RemoveAssignment)
		}
	}
	return r
}

func createAssignmentJSON(title string, deadline time.Time, instruction string, rubrics []data.AssignmentRubricRequest, attachments []data.AttachmentRequest) string {
	if rubrics == nil {
		rubrics = []data.AssignmentRubricRequest{}
	}
	if attachments == nil {
		attachments = []data.AttachmentRequest{}
	}
	req := map[string]any{
		"title":       title,
		"deadline":    deadline.Format(time.RFC3339),
		"instruction": instruction,
		"rubrics":     rubrics,
		"attachments": attachments,
	}
	b, _ := json.Marshal(req)
	return string(b)
}

func createAssignmentUpdateJSON(title string, deadline time.Time, instruction string, rubrics []data.AssignmentRubricRequest, attachments []data.AttachmentRequest) string {
	if rubrics == nil {
		rubrics = []data.AssignmentRubricRequest{}
	}
	if attachments == nil {
		attachments = []data.AttachmentRequest{}
	}
	req := map[string]any{
		"title":       title,
		"deadline":    deadline.Format(time.RFC3339),
		"instruction": instruction,
		"rubrics":     rubrics,
		"attachments": attachments,
	}
	b, _ := json.Marshal(req)
	return string(b)
}

// --- Tahap 7: Test Assignment Create ---

func TestAssignmentCreate(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupAssignmentTestRouter(db)

	deadline := time.Date(2026, 6, 15, 23, 59, 59, 0, time.UTC)

	t.Run("Create berhasil (tanpa attachment + rubric)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createAssignmentJSON("Tugas 1", deadline, "Kerjakan soal", nil, nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil dibuat" {
			t.Errorf("expected 'assignment successfully created', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Create berhasil (dengan rubric)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		rubrics := []data.AssignmentRubricRequest{
			{Name: "Content", Score: 80},
			{Name: "Presentation", Score: 20},
		}
		body := createAssignmentJSON("Tugas 1", deadline, "Kerjakan soal", rubrics, nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil dibuat" {
			t.Errorf("expected 'assignment successfully created', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Create berhasil (dengan attachment FILE)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		uploadResult, err := uploadFileAndGetResult(r, "/lms-usti-api/media/assignments", filepath.Join(dummyDir, "test_video.mp4"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}
		defer os.Remove(filepath.Join(testStoragePath, "assignments", uploadResult.UniqueFileName))

		attachments := []data.AttachmentRequest{
			{Name: "Video1", Type: "FILE", Url: uploadResult.FileUrl, UniqueName: uploadResult.UniqueFileName},
		}
		body := createAssignmentJSON("Tugas Video", deadline, "Upload video", nil, attachments)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil dibuat" {
			t.Errorf("expected 'assignment successfully created', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Create berhasil (dengan attachment LINK)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		attachments := []data.AttachmentRequest{
			{Name: "Referensi", Type: "LINK", Url: "https://example.com/doc", UniqueName: ""},
		}
		body := createAssignmentJSON("Tugas Link", deadline, "Baca referensi", nil, attachments)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil dibuat" {
			t.Errorf("expected 'assignment successfully created', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Create berhasil (lengkap)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		seedMahasiswaToClassroom(db, mhs, classroom)

		uploadResult, err := uploadFileAndGetResult(r, "/lms-usti-api/media/assignments", filepath.Join(dummyDir, "test_video.mp4"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}
		defer os.Remove(filepath.Join(testStoragePath, "assignments", uploadResult.UniqueFileName))

		rubrics := []data.AssignmentRubricRequest{
			{Name: "Content", Score: 70},
			{Name: "Creativity", Score: 30},
		}
		attachments := []data.AttachmentRequest{
			{Name: "Video", Type: "FILE", Url: uploadResult.FileUrl, UniqueName: uploadResult.UniqueFileName},
			{Name: "Referensi", Type: "LINK", Url: "https://example.com/guide", UniqueName: ""},
		}
		body := createAssignmentJSON("Tugas Lengkap", deadline, "Kerjakan dengan lengkap", rubrics, attachments)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil dibuat" {
			t.Errorf("expected 'assignment successfully created', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Title kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createAssignmentJSON("", deadline, "Kerjakan", nil, nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Deadline kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := `{"title":"Tugas","instruction":"Kerjakan"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Attachment type invalid", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		attachments := []data.AttachmentRequest{
			{Name: "Bad", Type: "SCRIPT", Url: "https://example.com", UniqueName: ""},
		}
		body := createAssignmentJSON("Tugas", deadline, "Kerjakan", nil, attachments)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		body := createAssignmentJSON("Tugas", deadline, "Kerjakan", nil, nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/some-id/assignments", body, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mahasiswaToken := createTestToken("MAHASISWA")
		body := createAssignmentJSON("Tugas", deadline, "Kerjakan", nil, nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/some-id/assignments", body, mahasiswaToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Classroom tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosenToken := createTestToken("DOSEN")

		body := createAssignmentJSON("Tugas", deadline, "Kerjakan", nil, nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/nonexistent-id/assignments", body, dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 8: Test Assignment FindAll, FindById, Delete ---

func TestAssignmentFindAll(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupAssignmentTestRouter(db)

	deadline := time.Date(2026, 6, 15, 23, 59, 59, 0, time.UTC)

	t.Run("Ada assignments", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createAssignmentJSON("Tugas 1", deadline, "Kerjakan", nil, nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, token)
		if w.Code != http.StatusOK {
			t.Fatalf("seed assignment failed: %s", string(w.Body.Bytes()))
		}

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil semua assignment" {
			t.Errorf("expected 'successfully fetch all assignments', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil semua assignment" {
			t.Errorf("expected 'successfully fetch all assignments', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Classroom tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		token := createTestToken("DOSEN")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/nonexistent-id/assignments", "", token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

func TestAssignmentFindById(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupAssignmentTestRouter(db)

	deadline := time.Date(2026, 6, 15, 23, 59, 59, 0, time.UTC)

	t.Run("Ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createAssignmentJSON("Tugas 1", deadline, "Kerjakan", nil, nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, token)
		if w.Code != http.StatusOK {
			t.Fatalf("seed assignment failed: %s", string(w.Body.Bytes()))
		}

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", "", token)
		if w.Code != http.StatusOK {
			t.Fatalf("find all failed: %s", string(w.Body.Bytes()))
		}
		var listRes struct {
			Data []struct {
				ID string `json:"id"`
			} `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &listRes)
		if len(listRes.Data) == 0 {
			t.Fatal("no assignments found")
		}
		assignmentId := listRes.Data[0].ID

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignmentId, "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil assignment" {
			t.Errorf("expected 'successfully fetch assignment', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/nonexistent-id", "", token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

func TestAssignmentDelete(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupAssignmentTestRouter(db)

	deadline := time.Date(2026, 6, 15, 23, 59, 59, 0, time.UTC)

	t.Run("Hapus berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createAssignmentJSON("Tugas 1", deadline, "Kerjakan", nil, nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, dosenToken)
		if w.Code != http.StatusOK {
			t.Fatalf("seed assignment failed: %s", string(w.Body.Bytes()))
		}

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", "", dosenToken)
		if w.Code != http.StatusOK {
			t.Fatalf("find all failed: %s", string(w.Body.Bytes()))
		}
		var listRes struct {
			Data []struct {
				ID string `json:"id"`
			} `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &listRes)
		if len(listRes.Data) == 0 {
			t.Fatal("no assignments found")
		}
		assignmentId := listRes.Data[0].ID

		w = makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignmentId, "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil dihapus" {
			t.Errorf("expected 'assignment successfully deleted', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Assignment tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/nonexistent-id", "", dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id/assignments/some-id", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mahasiswaToken := createTestToken("MAHASISWA")
		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id/assignments/some-id", "", mahasiswaToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 9: Test Assignment Update ---

func TestAssignmentUpdate(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupAssignmentTestRouter(db)

	deadline := time.Date(2026, 6, 15, 23, 59, 59, 0, time.UTC)
	newDeadline := time.Date(2026, 6, 20, 23, 59, 59, 0, time.UTC)

	t.Run("Update berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		rubrics := []data.AssignmentRubricRequest{
			{Name: "Content", Score: 80},
		}
		body := createAssignmentJSON("Tugas 1", deadline, "Kerjakan", rubrics, nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, dosenToken)
		if w.Code != http.StatusOK {
			t.Fatalf("seed assignment failed: %s", string(w.Body.Bytes()))
		}

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", "", dosenToken)
		if w.Code != http.StatusOK {
			t.Fatalf("find all failed: %s", string(w.Body.Bytes()))
		}
		var listRes struct {
			Data []struct {
				ID string `json:"id"`
			} `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &listRes)
		if len(listRes.Data) == 0 {
			t.Fatal("no assignments found")
		}
		assignmentId := listRes.Data[0].ID

		newRubrics := []data.AssignmentRubricRequest{
			{Name: "Content", Score: 90},
			{Name: "Creativity", Score: 10},
		}
		uploadResult, err := uploadFileAndGetResult(r, "/lms-usti-api/media/assignments", filepath.Join(dummyDir, "test_video.mp4"), dosenToken)
		if err != nil {
			t.Fatalf("upload failed: %v", err)
		}
		defer os.Remove(filepath.Join(testStoragePath, "assignments", uploadResult.UniqueFileName))

		newAttachments := []data.AttachmentRequest{
			{Name: "VideoBaru", Type: "FILE", Url: uploadResult.FileUrl, UniqueName: uploadResult.UniqueFileName},
			{Name: "LinkBaru", Type: "LINK", Url: "https://example.com/new", UniqueName: ""},
		}
		updateBody := createAssignmentUpdateJSON("Tugas Updated", newDeadline, "Instruksi baru", newRubrics, newAttachments)
		w = makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignmentId, updateBody, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "assignment berhasil diperbarui" {
			t.Errorf("expected 'assignment successfully updated', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Assignment tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := createTestToken("DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		updateBody := createAssignmentUpdateJSON("Tugas", deadline, "Kerjakan", nil, nil)
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/nonexistent-id", updateBody, dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mahasiswaToken := createTestToken("MAHASISWA")
		body := createAssignmentUpdateJSON("Tugas", deadline, "Kerjakan", nil, nil)
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/some-id/assignments/some-id", body, mahasiswaToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}
