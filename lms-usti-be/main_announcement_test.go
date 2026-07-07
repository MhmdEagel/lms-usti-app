package main

import (
	"encoding/json"
	"net/http"
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

func seedAnnouncement(db *gorm.DB, classroomId, dosenId, title, content string) model.Announcement {
	announcement := model.Announcement{
		Title:       title,
		Content:     content,
		ClassroomId: classroomId,
		DosenId:     dosenId,
	}
	result := db.Create(&announcement)
	if result.Error != nil {
		panic("failed to seed announcement: " + result.Error.Error())
	}
	return announcement
}

func setupAnnouncementTestRouter(db *gorm.DB) *gin.Engine {
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
	announcementRepo := repositories.NewAnnouncementRepository(db)
	assignmentRepo := repositories.NewAssignmentRepository(db)
	submissionRepo := repositories.NewSubmissionRepository(db)
	commentRepo := repositories.NewCommentRepository(db)
	contentViewRepo := repositories.NewContentViewRepository(db)

	mediaService := services.NewMediaService()
	authService := services.NewAuthService(userRepo, verificationRepo, mediaService)
	submissionService := services.NewSubmissionService(submissionRepo, assignmentRepo)
	assignmentService := services.NewAssignmentService(assignmentRepo, classroomRepo, submissionService, contentViewRepo)
	classroomPolicyRepo := repositories.NewClassroomPolicyRepository(db)
	classroomService := services.NewClassroomService(classroomRepo, userRepo, submissionService, assignmentService, classroomPolicyRepo)
	announcementService := services.NewAnnouncementService(announcementRepo, classroomRepo, commentRepo)

	authController := controllers.NewAuthController(authService)
	classroomController := controllers.NewClassroomController(classroomService)
	announcementController := controllers.NewAnnouncementController(announcementService)

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
			classroom.GET("/dosen/classrooms", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.FindAllByDosenId)
			classroom.GET("/mahasiswa/classrooms", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.FindAllByMahasiswaId)
			classroom.POST("/join", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.Enroll)
			classroom.GET("/:id", classroomController.FindById)
			classroom.GET("/:id/members", classroomController.FindAllClassroomMember)
			classroom.DELETE("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Delete)
			classroom.PUT("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Update)

			classroom.GET("/:id/announcements", announcementController.FindAll)
			classroom.POST("/:id/announcements", aclMiddleware.Handle([]string{"DOSEN"}), announcementController.Create)
			classroom.DELETE("/:id/announcements/:announcementId", aclMiddleware.Handle([]string{"DOSEN"}), announcementController.Delete)
		}
	}
	return r
}

// --- Tahap 3: Test Announcement Create ---

func TestAnnouncementCreate(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupAnnouncementTestRouter(db)

	dosenToken := createTestToken("DOSEN")
	mahasiswaToken := createTestToken("MAHASISWA")

	t.Run("Create berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := `{"title":"Pengumuman UTS","content":"Ujian dimulai pukul 08.00"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/announcements", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "announcement berhasil dibuat" {
			t.Errorf("expected 'announcement berhasil dibuat', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Title kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := `{"title":"","content":"Ujian dimulai pukul 08.00"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/announcements", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Content kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := `{"title":"Pengumuman","content":""}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/announcements", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{"title":"Pengumuman","content":"Test"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/some-id/announcements", body, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{"title":"Pengumuman","content":"Test"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/some-id/announcements", body, mahasiswaToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Classroom tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")

		body := `{"title":"Pengumuman UTS","content":"Ujian dimulai pukul 08.00"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/nonexistent-id/announcements", body, dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 4: Test Announcement FindAll ---

func TestAnnouncementFindAll(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupAnnouncementTestRouter(db)

	dosenToken := createTestToken("DOSEN")

	t.Run("Ada announcements", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		seedAnnouncement(db, classroom.ID, dosen.ID, "Pengumuman 1", "Konten 1")
		seedAnnouncement(db, classroom.ID, dosen.ID, "Pengumuman 2", "Konten 2")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/announcements", "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil semua announcement" {
			t.Errorf("expected 'berhasil mengambil semua announcement', got '%s'", res.Meta.Message)
		}
		var announcements []data.AnnouncementResponse
		json.Unmarshal(res.Data, &announcements)
		if len(announcements) != 2 {
			t.Errorf("expected 2 announcements, got %d", len(announcements))
		}
	})

	t.Run("Kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/announcements", "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var announcements []data.AnnouncementResponse
		json.Unmarshal(res.Data, &announcements)
		if len(announcements) != 0 {
			t.Errorf("expected 0 announcements, got %d", len(announcements))
		}
	})

	t.Run("Classroom tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "GET", "/lms-usti-api/classroom/nonexistent-id/announcements", "", dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 5: Test Announcement Delete ---

func TestAnnouncementDelete(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupAnnouncementTestRouter(db)

	dosenToken := createTestToken("DOSEN")
	mahasiswaToken := createTestToken("MAHASISWA")

	t.Run("Hapus berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		announcement := seedAnnouncement(db, classroom.ID, dosen.ID, "Pengumuman", "Test")

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/announcements/"+announcement.ID, "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "announcement berhasil dihapus" {
			t.Errorf("expected 'announcement berhasil dihapus', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Announcement tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/announcements/nonexistent-id", "", dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id/announcements/some-id", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id/announcements/some-id", "", mahasiswaToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}
