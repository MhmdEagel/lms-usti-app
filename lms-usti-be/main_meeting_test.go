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

func newMeetingTestRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	authMiddleware := middleware.NewAuthMiddleware()
	aclMiddleware := middleware.NewAclMiddleware()
	globalErrMiddleware := middleware.NewGlobalErrMiddleware()
	r.Use(globalErrMiddleware.Handle())

	userRepo := repositories.NewUserRepository(db)
	verificationRepo := repositories.NewVerificationRepository(db)
	classroomRepo := repositories.NewClassroomRepository(db)
	meetingRepo := repositories.NewMeetingRepository(db)
	assignmentRepo := repositories.NewAssignmentRepository(db)
	submissionRepo := repositories.NewSubmissionRepository(db)
	contentViewRepo := repositories.NewContentViewRepository(db)
	materialRepo := repositories.NewMaterialRepository(db)

	mediaService := services.NewMediaService()
	authService := services.NewAuthService(userRepo, verificationRepo, mediaService)
	submissionService := services.NewSubmissionService(submissionRepo, assignmentRepo)
	assignmentService := services.NewAssignmentService(assignmentRepo, classroomRepo, submissionService, contentViewRepo)
	classroomPolicyRepo := repositories.NewClassroomPolicyRepository(db)
	classroomService := services.NewClassroomService(classroomRepo, userRepo, submissionService, assignmentService, classroomPolicyRepo)
	meetingService := services.NewMeetingService(meetingRepo, classroomRepo)
	materialService := services.NewMaterialService(materialRepo, classroomRepo, contentViewRepo)

	authController := controllers.NewAuthController(authService)
	classroomController := controllers.NewClassroomController(classroomService)
	meetingController := controllers.NewMeetingController(meetingService)
	materialController := controllers.NewMaterialController(materialService)

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
			classroom.GET("/:id", classroomController.FindById)
			classroom.DELETE("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Delete)

			classroom.GET("/:id/meetings", meetingController.FindAll)
			classroom.POST("/:id/meetings", aclMiddleware.Handle([]string{"DOSEN"}), meetingController.Create)
			classroom.PUT("/:id/meetings/reorder", aclMiddleware.Handle([]string{"DOSEN"}), meetingController.Reorder)
			classroom.GET("/:id/meetings/:meetingId", meetingController.FindById)
			classroom.PUT("/:id/meetings/:meetingId", aclMiddleware.Handle([]string{"DOSEN"}), meetingController.Update)
			classroom.DELETE("/:id/meetings/:meetingId", aclMiddleware.Handle([]string{"DOSEN"}), meetingController.Delete)

			classroom.POST("/:id/materials", aclMiddleware.Handle([]string{"DOSEN"}), materialController.Create)
			classroom.GET("/:id/materials/:materialId", materialController.FindById)
			classroom.DELETE("/:id/materials/:materialId", aclMiddleware.Handle([]string{"DOSEN"}), materialController.Delete)
		}
	}
	return r
}

func createMeetingJSON(topic, description string) string {
	req := map[string]any{
		"topic":       topic,
		"description": description,
	}
	b, _ := json.Marshal(req)
	return string(b)
}

func createMeetingUpdateJSON(position *int, topic, description *string) string {
	req := map[string]any{}
	if position != nil {
		req["position"] = *position
	}
	if topic != nil {
		req["topic"] = *topic
	}
	if description != nil {
		req["description"] = *description
	}
	b, _ := json.Marshal(req)
	return string(b)
}

func createReorderJSON(meetingIDs []string) string {
	req := map[string]any{
		"meeting_ids": meetingIDs,
	}
	b, _ := json.Marshal(req)
	return string(b)
}

func seedMeeting(db *gorm.DB, classroomId, dosenId, topic string, position int) model.Meeting {
	meeting := model.Meeting{
		Position:    position,
		Topic:       topic,
		Description: "Deskripsi",
		ClassroomId: classroomId,
		DosenId:     dosenId,
	}
	result := db.Create(&meeting)
	if result.Error != nil {
		panic("failed to seed meeting: " + result.Error.Error())
	}
	return meeting
}

func setupMeetingTestDB() *gorm.DB {
	db := setupTestDB()
	db.AutoMigrate(&model.Meeting{})
	db.Migrator().DropColumn(&model.Meeting{}, "title")
	return db
}

// --- Test Meeting Create ---

func TestMeetingCreate(t *testing.T) {
	db := setupMeetingTestDB()
	defer cleanupDatabase(db)
	r := newMeetingTestRouter(db)

	dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
	dosenToken := generateToken(dosen)

	t.Run("Create berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMeetingJSON("Pengenalan", "Deskripsi pertemuan")
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusCreated {
			t.Errorf("expected 201, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "pertemuan berhasil dibuat" {
			t.Errorf("expected 'pertemuan berhasil dibuat', got '%s'", res.Meta.Message)
		}

		var meetings []model.Meeting
		db.Where("classroom_id = ?", classroom.ID).Find(&meetings)
		if len(meetings) != 1 {
			t.Fatalf("expected 1 meeting, got %d", len(meetings))
		}
		if meetings[0].Position != 1 {
			t.Errorf("expected position 1 (auto-increment), got %d", meetings[0].Position)
		}
		if meetings[0].DosenId != dosen.ID {
			t.Errorf("expected dosen_id %s, got %s", dosen.ID, meetings[0].DosenId)
		}
	})

	t.Run("Auto-increment position", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMeetingJSON("Topik 1", "Deskripsi")
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", body, dosenToken)
		if w.Code != http.StatusCreated {
			t.Fatalf("create 1 failed: %s", string(w.Body.Bytes()))
		}

		body = createMeetingJSON("Topik 2", "Deskripsi")
		w = makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", body, dosenToken)
		if w.Code != http.StatusCreated {
			t.Fatalf("create 2 failed: %s", string(w.Body.Bytes()))
		}

		body = createMeetingJSON("Topik 3", "Deskripsi")
		w = makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", body, dosenToken)
		if w.Code != http.StatusCreated {
			t.Fatalf("create 3 failed: %s", string(w.Body.Bytes()))
		}

		var meetings []model.Meeting
		db.Where("classroom_id = ?", classroom.ID).Order("position ASC").Find(&meetings)
		if len(meetings) != 3 {
			t.Fatalf("expected 3 meetings, got %d", len(meetings))
		}
		for i, m := range meetings {
			expectedPos := i + 1
			if m.Position != expectedPos {
				t.Errorf("meeting %d: expected position %d, got %d", i, expectedPos, m.Position)
			}
		}
	})

	t.Run("Topic kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMeetingJSON("", "Deskripsi")
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", body, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		body := createMeetingJSON("Pengenalan", "Deskripsi")
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/some-id/meetings", body, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		mahasiswaToken := generateToken(mhs)
		body := createMeetingJSON("Pengenalan", "Deskripsi")
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/some-id/meetings", body, mahasiswaToken)
		if w.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Classroom tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)

		body := createMeetingJSON("Pengenalan", "Deskripsi")
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/nonexistent-id/meetings", body, dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Bukan pemilik classroom", func(t *testing.T) {
		cleanupDatabase(db)
		otherDosen := seedUser(db, "Dosen Lain", "other@test.com", "password123", "DOSEN")
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, otherDosen.ID, "Matematika Dasar")

		body := createMeetingJSON("Pengenalan", "Deskripsi")
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", body, dosenToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Maksimal 16 pertemuan", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		for i := 1; i <= 16; i++ {
			body := createMeetingJSON("Topik", "Deskripsi")
			w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", body, dosenToken)
			if w.Code != http.StatusCreated {
				t.Fatalf("seed meeting %d failed: %s", i, string(w.Body.Bytes()))
			}
		}

		body := createMeetingJSON("Topik", "Deskripsi")
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "maksimal 16 pertemuan per kelas" {
			t.Errorf("expected 'maksimal 16 pertemuan per kelas', got '%s'", res.Meta.Message)
		}
	})
}

// --- Test Meeting FindAll ---

func TestMeetingFindAll(t *testing.T) {
	db := setupMeetingTestDB()
	defer cleanupDatabase(db)
	r := newMeetingTestRouter(db)

	t.Run("Ada meetings", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMeetingJSON("Pengenalan", "Deskripsi")
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", body, token)
		if w.Code != http.StatusCreated {
			t.Fatalf("seed meeting failed: %s", string(w.Body.Bytes()))
		}

		w = makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil pertemuan" {
			t.Errorf("expected 'berhasil mengambil pertemuan', got '%s'", res.Meta.Message)
		}
		if res.Data == nil {
			t.Errorf("expected non-nil data")
		}
	})

	t.Run("Urut berdasarkan position", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		seedMeeting(db, classroom.ID, dosen.ID, "Topik 2", 2)
		seedMeeting(db, classroom.ID, dosen.ID, "Topik 1", 1)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", "", token)
		if w.Code != http.StatusOK {
			t.Fatalf("find all failed: %s", string(w.Body.Bytes()))
		}
		var listRes struct {
			Data []struct {
				ID       string `json:"id"`
				Position int    `json:"position"`
			} `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &listRes)
		if len(listRes.Data) != 2 {
			t.Fatalf("expected 2 meetings, got %d", len(listRes.Data))
		}
		if listRes.Data[0].Position != 1 {
			t.Errorf("expected position 1 first, got %d", listRes.Data[0].Position)
		}
		if listRes.Data[1].Position != 2 {
			t.Errorf("expected position 2 second, got %d", listRes.Data[1].Position)
		}
	})

	t.Run("Kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/meetings", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil pertemuan" {
			t.Errorf("expected 'berhasil mengambil pertemuan', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Classroom tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/nonexistent-id/meetings", "", token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "GET", "/lms-usti-api/classroom/some-id/meetings", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Test Meeting FindById ---

func TestMeetingFindById(t *testing.T) {
	db := setupMeetingTestDB()
	defer cleanupDatabase(db)
	r := newMeetingTestRouter(db)

	t.Run("Ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		meeting := seedMeeting(db, classroom.ID, dosen.ID, "Pengenalan", 1)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/"+meeting.ID, "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil pertemuan" {
			t.Errorf("expected 'berhasil mengambil pertemuan', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/nonexistent-id", "", token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Classroom tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		token := generateToken(dosen)

		w := makeRequest(r, "GET", "/lms-usti-api/classroom/nonexistent-id/meetings/some-id", "", token)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Test Meeting Update ---

func TestMeetingUpdate(t *testing.T) {
	db := setupMeetingTestDB()
	defer cleanupDatabase(db)
	r := newMeetingTestRouter(db)

	dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
	dosenToken := generateToken(dosen)

	t.Run("Update berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		meeting := seedMeeting(db, classroom.ID, dosen.ID, "Pengenalan", 1)

		newTopic := "Pengenalan Updated"
		newPos := 2
		newDesc := "Deskripsi baru"
		body := createMeetingUpdateJSON(&newPos, &newTopic, &newDesc)
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/"+meeting.ID, body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "pertemuan berhasil diperbarui" {
			t.Errorf("expected 'pertemuan berhasil diperbarui', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Update partial", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		meeting := seedMeeting(db, classroom.ID, dosen.ID, "Pengenalan", 1)

		newTopic := "Topik Baru"
		body := createMeetingUpdateJSON(nil, &newTopic, nil)
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/"+meeting.ID, body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "pertemuan berhasil diperbarui" {
			t.Errorf("expected 'pertemuan berhasil diperbarui', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Meeting tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		body := createMeetingUpdateJSON(nil, nil, nil)
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/nonexistent-id", body, dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Bukan pemilik classroom", func(t *testing.T) {
		cleanupDatabase(db)
		otherDosen := seedUser(db, "Dosen Lain", "other@test.com", "password123", "DOSEN")
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, otherDosen.ID, "Matematika Dasar")
		meeting := seedMeeting(db, classroom.ID, otherDosen.ID, "Topik", 1)

		body := createMeetingUpdateJSON(nil, nil, nil)
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/"+meeting.ID, body, dosenToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		mahasiswaToken := generateToken(mhs)
		body := createMeetingUpdateJSON(nil, nil, nil)
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/some-id/meetings/some-id", body, mahasiswaToken)
		if w.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		body := createMeetingUpdateJSON(nil, nil, nil)
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/some-id/meetings/some-id", body, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Test Meeting Delete ---

func TestMeetingDelete(t *testing.T) {
	db := setupMeetingTestDB()
	defer cleanupDatabase(db)
	r := newMeetingTestRouter(db)

	dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
	dosenToken := generateToken(dosen)

	t.Run("Hapus berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		meeting := seedMeeting(db, classroom.ID, dosen.ID, "Topik", 1)

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/"+meeting.ID, "", dosenToken)
		if w.Code != http.StatusNoContent {
			t.Errorf("expected 204, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Meeting tidak ada", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/nonexistent-id", "", dosenToken)
		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Bukan pemilik classroom", func(t *testing.T) {
		cleanupDatabase(db)
		otherDosen := seedUser(db, "Dosen Lain", "other@test.com", "password123", "DOSEN")
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, otherDosen.ID, "Matematika Dasar")
		meeting := seedMeeting(db, classroom.ID, otherDosen.ID, "Topik", 1)

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/"+meeting.ID, "", dosenToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id/meetings/some-id", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		mahasiswaToken := generateToken(mhs)
		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/some-id/meetings/some-id", "", mahasiswaToken)
		if w.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Test Meeting Reorder ---

func TestMeetingReorder(t *testing.T) {
	db := setupMeetingTestDB()
	defer cleanupDatabase(db)
	r := newMeetingTestRouter(db)

	dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
	dosenToken := generateToken(dosen)

	t.Run("Reorder berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		m1 := seedMeeting(db, classroom.ID, dosen.ID, "Topik 1", 1)
		m2 := seedMeeting(db, classroom.ID, dosen.ID, "Topik 2", 2)
		m3 := seedMeeting(db, classroom.ID, dosen.ID, "Topik 3", 3)

		body := createReorderJSON([]string{m3.ID, m2.ID, m1.ID})
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/reorder", body, dosenToken)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "pertemuan berhasil diurutkan ulang" {
			t.Errorf("expected 'pertemuan berhasil diurutkan ulang', got '%s'", res.Meta.Message)
		}

		var meetings []model.Meeting
		db.Where("classroom_id = ?", classroom.ID).Order("position ASC").Find(&meetings)
		if len(meetings) != 3 {
			t.Fatalf("expected 3 meetings, got %d", len(meetings))
		}
		if meetings[0].ID != m3.ID {
			t.Errorf("expected first meeting ID %s, got %s", m3.ID, meetings[0].ID)
		}
		if meetings[1].ID != m2.ID {
			t.Errorf("expected second meeting ID %s, got %s", m2.ID, meetings[1].ID)
		}
		if meetings[2].ID != m1.ID {
			t.Errorf("expected third meeting ID %s, got %s", m1.ID, meetings[2].ID)
		}
		if meetings[0].Position != 1 || meetings[1].Position != 2 || meetings[2].Position != 3 {
			t.Errorf("expected positions 1,2,3 got %d,%d,%d", meetings[0].Position, meetings[1].Position, meetings[2].Position)
		}
	})

	t.Run("Meeting tidak ada di classroom lain", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")
		seedMeeting(db, classroom.ID, dosen.ID, "Topik", 1)

		body := createReorderJSON([]string{"nonexistent-id"})
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/reorder", body, dosenToken)
		if w.Code != http.StatusInternalServerError {
			t.Errorf("expected 500, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Bukan pemilik classroom", func(t *testing.T) {
		cleanupDatabase(db)
		otherDosen := seedUser(db, "Dosen Lain", "other@test.com", "password123", "DOSEN")
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)
		classroom := seedClassroom(db, otherDosen.ID, "Matematika Dasar")
		meeting := seedMeeting(db, classroom.ID, otherDosen.ID, "Topik", 1)

		body := createReorderJSON([]string{meeting.ID})
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/reorder", body, dosenToken)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token MAHASISWA", func(t *testing.T) {
		cleanupDatabase(db)
		mhs := seedUser(db, "Mhs Test", "mhs@test.com", "password123", "MAHASISWA")
		mahasiswaToken := generateToken(mhs)
		body := createReorderJSON([]string{"some-id"})
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/some-id/meetings/reorder", body, mahasiswaToken)
		if w.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		body := createReorderJSON([]string{"some-id"})
		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/some-id/meetings/reorder", body, "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Body kosong", func(t *testing.T) {
		cleanupDatabase(db)
		dosen = seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken = generateToken(dosen)

		w := makeRequest(r, "PUT", "/lms-usti-api/classroom/some-id/meetings/reorder", `{}`, dosenToken)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Test Meeting Cascade Delete ---

func TestMeetingCascade(t *testing.T) {
	db := setupMeetingTestDB()
	defer cleanupDatabase(db)
	r := newMeetingTestRouter(db)

	t.Run("Hapus meeting — material ikut terhapus (CASCADE)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		meeting := seedMeeting(db, classroom.ID, dosen.ID, "Topik", 1)

		material := model.Material{
			Title:       "Materi 1",
			Description: "Deskripsi",
			ClassroomId: classroom.ID,
			DosenId:     dosen.ID,
			MeetingId:   &meeting.ID,
		}
		if err := db.Create(&material).Error; err != nil {
			t.Fatalf("seed material failed: %v", err)
		}

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/meetings/"+meeting.ID, "", dosenToken)
		if w.Code != http.StatusNoContent {
			t.Fatalf("delete failed: %d: %s", w.Code, string(w.Body.Bytes()))
		}

		var count int64
		db.Model(&model.Material{}).Where("id = ?", material.ID).Count(&count)
		if count != 0 {
			t.Errorf("expected material to be cascade deleted, but %d found", count)
		}
	})

	t.Run("Hapus classroom — meeting ikut terhapus (CASCADE)", func(t *testing.T) {
		cleanupDatabase(db)
		dosen := seedUser(db, "Dosen Test", "dosen@test.com", "password123", "DOSEN")
		dosenToken := generateToken(dosen)
		classroom := seedClassroom(db, dosen.ID, "Matematika Dasar")

		seedMeeting(db, classroom.ID, dosen.ID, "Topik", 1)
		seedMeeting(db, classroom.ID, dosen.ID, "Topik", 2)

		w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID, "", dosenToken)
		if w.Code != http.StatusOK {
			t.Fatalf("delete classroom failed: %d: %s", w.Code, string(w.Body.Bytes()))
		}

		var count int64
		db.Model(&model.Meeting{}).Where("classroom_id = ?", classroom.ID).Count(&count)
		if count != 0 {
			t.Errorf("expected 0 meetings after classroom deleted, got %d", count)
		}
	})
}
