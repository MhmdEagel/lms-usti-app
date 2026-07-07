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

func seedClassroomForumPost(db *gorm.DB, classroomId, dosenId, title, content string) model.ClassroomForumPost {
	forumPost := model.ClassroomForumPost{
		Title:       title,
		Content:     content,
		ClassroomId: classroomId,
		DosenId:     dosenId,
	}
	result := db.Create(&forumPost)
	if result.Error != nil {
		panic("failed to seed announcement: " + result.Error.Error())
	}
	return forumPost
}

func setupClassroomForumPostTestRouter(db *gorm.DB) *gin.Engine {
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
	classroomForumPostRepo := repositories.NewClassroomForumPostRepository(db)
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
	classroomForumPostService := services.NewClassroomForumPostService(classroomForumPostRepo, classroomRepo, commentRepo, classroomPolicyRepo)

	authController := controllers.NewAuthController(authService)
	classroomController := controllers.NewClassroomController(classroomService)
	classroomForumPostController := controllers.NewClassroomForumPostController(classroomForumPostService)

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

			classroom.GET("/:id/forumPosts", classroomForumPostController.FindAll)
			classroom.POST("/:id/forumPosts", aclMiddleware.Handle([]string{"DOSEN"}), classroomForumPostController.Create)
			classroom.DELETE("/:id/forumPosts/:announcementId", aclMiddleware.Handle([]string{"DOSEN"}), classroomForumPostController.Delete)
		}
	}
	return r
}

// --- Tahap 3: Test Announcement Create ---

func TestClassroomForumPostCreate(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupClassroomForumPostTestRouter(db)

	dosenToken := createTestToken("DOSEN")
	mahasiswaToken := createTestToken("MAHASISWA")

	t.Run("Create berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := `{"title":"Pengumuman UTS","content":"Ujian dimulai pukul 08.00"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/forumPosts", body, dosenToken)
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
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/forumPosts", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Content kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := `{"title":"Pengumuman","content":""}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/forumPosts", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{"title":"Pengumuman","content":"Test"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/some-id/forumPosts", body, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{"title":"Pengumuman","content":"Test"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/some-id/forumPosts", body, mahasiswaToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Classroom tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")

		body := `{"title":"Pengumuman UTS","content":"Ujian dimulai pukul 08.00"}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/nonexistent-id/forumPosts", body, dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 4: Test Announcement FindAll ---

func TestClassroomForumPostFindAll(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupClassroomForumPostTestRouter(db)

	dosenToken := createTestToken("DOSEN")

	t.Run("Ada forumPosts", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		seedClassroomForumPost(db, classroom.ID, dosen.ID, "Forum Post 1", "Konten 1")
		seedClassroomForumPost(db, classroom.ID, dosen.ID, "Forum Post 2", "Konten 2")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/forumPosts", "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil semua announcement" {
			t.Errorf("expected 'berhasil mengambil semua announcement', got '%s'", res.Meta.Message)
		}
		var forumPosts []data.ClassroomForumPostResponse
		json.Unmarshal(res.Data, &forumPosts)
		if len(forumPosts) != 2 {
			t.Errorf("expected 2 forumPosts, got %d", len(forumPosts))
		}
	})

	t.Run("Kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/forumPosts", "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var forumPosts []data.ClassroomForumPostResponse
		json.Unmarshal(res.Data, &forumPosts)
		if len(forumPosts) != 0 {
			t.Errorf("expected 0 forumPosts, got %d", len(forumPosts))
		}
	})

	t.Run("Classroom tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "GET", "/lms-usti-api/classroom/nonexistent-id/forumPosts", "", dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 5: Test Announcement Delete ---

func TestClassroomForumPostDelete(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupClassroomForumPostTestRouter(db)

	dosenToken := createTestToken("DOSEN")
	mahasiswaToken := createTestToken("MAHASISWA")

	t.Run("Hapus berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		forumPost := seedClassroomForumPost(db, classroom.ID, dosen.ID, "Pengumuman", "Test")

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/forumPosts/"+announcement.ID, "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "announcement berhasil dihapus" {
			t.Errorf("expected 'announcement berhasil dihapus', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Forum post tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/forumPosts/nonexistent-id", "", dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id/forumPosts/some-id", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id/forumPosts/some-id", "", mahasiswaToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}
