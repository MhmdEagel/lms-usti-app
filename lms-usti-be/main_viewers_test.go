package main

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/MhmdEagel/lms-usti-be/controllers"
	"github.com/MhmdEagel/lms-usti-be/middleware"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupViewersTestRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

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
	contentViewRepo := repositories.NewContentViewRepository(db)

	mediaService := services.NewMediaService()
	authService := services.NewAuthService(userRepo, verificationRepo, mediaService)
	submissionService := services.NewSubmissionService(submissionRepo, assignmentRepo)
	assignmentService := services.NewAssignmentService(assignmentRepo, classroomRepo, submissionService, contentViewRepo)
	classroomPolicyRepo := repositories.NewClassroomPolicyRepository(db)
	classroomService := services.NewClassroomService(classroomRepo, userRepo, submissionService, assignmentService, classroomPolicyRepo)
	materialService := services.NewMaterialService(materialRepo, classroomRepo, contentViewRepo)

	authController := controllers.NewAuthController(authService)
	classroomController := controllers.NewClassroomController(classroomService)
	materialController := controllers.NewMaterialController(materialService)
	assignmentController := controllers.NewAssignmentController(assignmentService)

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

			classroom.GET("/:id/materials", materialController.FindAll)
			classroom.GET("/:id/materials/:materialId", materialController.FindById)
			classroom.POST("/:id/materials", aclMiddleware.Handle([]string{"DOSEN"}), materialController.Create)
			classroom.PUT("/:id/materials/:materialId", aclMiddleware.Handle([]string{"DOSEN"}), materialController.Update)
			classroom.DELETE("/:id/materials/:materialId", aclMiddleware.Handle([]string{"DOSEN"}), materialController.Delete)
			classroom.GET("/:id/materials/:materialId/viewers", aclMiddleware.Handle([]string{"DOSEN", "PRODI"}), materialController.GetViewers)

			classroom.GET("/:id/assignments", assignmentController.FindAll)
			classroom.GET("/:id/assignments/:assignmentId", assignmentController.FindById)
			classroom.POST("/:id/assignments", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Create)
			classroom.PUT("/:id/assignments/:assignmentId", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Update)
			classroom.DELETE("/:id/assignments/:assignmentId", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Delete)
			classroom.GET("/:id/assignments/:assignmentId/viewers", aclMiddleware.Handle([]string{"DOSEN", "PRODI"}), assignmentController.GetViewers)

			classroom.GET("/:id/grades", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.GetGrades)
			classroom.GET("/:id/my-grades", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.GetMyGrades)
		}
	}
	return r
}

func seedContentView(db *gorm.DB, userID, viewableType, viewableID string) {
	cv := model.ContentView{
		UserID:       userID,
		ViewableType: viewableType,
		ViewableID:   viewableID,
	}
	db.Create(&cv)
}

func TestMaterialViewers(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupViewersTestRouter(db)

	t.Run("Get viewers berhasil — DOSEN", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := generateToken(dosen)
		mhs1 := seedUser(db, "Mahasiswa 1", "mhs1@test.com", "password123", "MAHASISWA")
		mhs2 := seedUser(db, "Mahasiswa 2", "mhs2@test.com", "password123", "MAHASISWA")
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

		seedContentView(db, dosen.ID, model.ViewableTypeMaterial, materialId)
		seedContentView(db, mhs1.ID, model.ViewableTypeMaterial, materialId)
		seedContentView(db, mhs2.ID, model.ViewableTypeMaterial, materialId)

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+materialId+"/viewers", "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil viewers" {
			t.Errorf("expected 'berhasil mengambil viewers', got '%s'", res.Meta.Message)
		}
		var viewers []struct {
			ID       string `json:"id"`
			Fullname string `json:"fullname"`
			Role     string `json:"role"`
		}
		json.Unmarshal(res.Data, &viewers)
		if len(viewers) != 3 {
			t.Errorf("expected 3 viewers, got %d", len(viewers))
		}
	})

	t.Run("Get viewers — PRODI", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		prodi := seedUser(db, "Prodi Test", "prodi@test.com", "password123", "PRODI")
		prodiToken := generateToken(prodi)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMaterialRequestJSON("Materi 1", "Deskripsi", nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/materials", body, generateToken(dosen))
		if w.Code != http.StatusOK {
			t.Fatalf("seed material failed: %s", string(w.Body.Bytes()))
		}
		var listRes struct {
			Data []struct {
				Id string `json:"id"`
			} `json:"data"`
		}
		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials", "", generateToken(dosen))
		json.Unmarshal(w.Body.Bytes(), &listRes)
		if len(listRes.Data) == 0 {
			t.Fatal("no materials found")
		}
		materialId := listRes.Data[0].Id

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+materialId+"/viewers", "", prodiToken)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200 for PRODI, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Get viewers — MAHASISWA ditolak", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		mhsToken := generateToken(mhs)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/some-id/materials/some-id/viewers", "", mhsToken)
		if w.Code != http.StatusForbidden {
			t.Errorf("expected 403 for MAHASISWA, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Get viewers — empty saat belum ada yang melihat", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := generateToken(dosen)
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

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials/"+materialId+"/viewers", "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var viewers []any
		json.Unmarshal(res.Data, &viewers)
		if len(viewers) != 0 {
			t.Errorf("expected empty viewers, got %d", len(viewers))
		}
	})

	t.Run("Get viewers — material tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/materials/nonexistent-id/viewers", "", dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

func TestAssignmentViewers(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupViewersTestRouter(db)

	t.Run("Get viewers berhasil — DOSEN", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := generateToken(dosen)
		mhs1 := seedUser(db, "Mahasiswa 1", "mhs1@test.com", "password123", "MAHASISWA")
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		assignmentReq := `{"title":"Tugas 1","deadline":null}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", assignmentReq, dosenToken)
		if w.Code != http.StatusOK {
			t.Fatalf("seed assignment failed: %s", string(w.Body.Bytes()))
		}
		var listRes struct {
			Data []struct {
				ID string `json:"id"`
			} `json:"data"`
		}
		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", "", dosenToken)
		json.Unmarshal(w.Body.Bytes(), &listRes)
		if len(listRes.Data) == 0 {
			t.Fatal("no assignments found")
		}
		assignmentId := listRes.Data[0].ID

		seedContentView(db, dosen.ID, model.ViewableTypeAssignment, assignmentId)
		seedContentView(db, mhs1.ID, model.ViewableTypeAssignment, assignmentId)

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignmentId+"/viewers", "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil viewers" {
			t.Errorf("expected 'berhasil mengambil viewers', got '%s'", res.Meta.Message)
		}
		var viewers []struct {
			ID       string `json:"id"`
			Fullname string `json:"fullname"`
			Role     string `json:"role"`
		}
		json.Unmarshal(res.Data, &viewers)
		if len(viewers) != 2 {
			t.Errorf("expected 2 viewers, got %d", len(viewers))
		}
	})

	t.Run("Get viewers — MAHASISWA ditolak", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		mhsToken := generateToken(mhs)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/some-id/assignments/some-id/viewers", "", mhsToken)
		if w.Code != http.StatusForbidden {
			t.Errorf("expected 403 for MAHASISWA, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Get viewers — empty saat belum ada yang melihat", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		assignmentReq := `{"title":"Tugas 1","deadline":null}`
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", assignmentReq, dosenToken)
		if w.Code != http.StatusOK {
			t.Fatalf("seed assignment failed: %s", string(w.Body.Bytes()))
		}
		var listRes struct {
			Data []struct {
				ID string `json:"id"`
			} `json:"data"`
		}
		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", "", dosenToken)
		json.Unmarshal(w.Body.Bytes(), &listRes)
		if len(listRes.Data) == 0 {
			t.Fatal("no assignments found")
		}
		assignmentId := listRes.Data[0].ID

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignmentId+"/viewers", "", dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		var viewers []any
		json.Unmarshal(res.Data, &viewers)
		if len(viewers) != 0 {
			t.Errorf("expected empty viewers, got %d", len(viewers))
		}
	})

	t.Run("Get viewers — assignment tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/nonexistent-id/viewers", "", dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}
