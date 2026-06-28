package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/MhmdEagel/lms-usti-be/controllers"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/middleware"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to test database: " + err.Error())
	}
	db.AutoMigrate(&model.User{}, &model.VerificationToken{}, &model.Classroom{}, &model.Announcement{}, &model.Material{}, &model.MaterialAttachment{}, &model.Assignment{}, &model.AssignmentRubric{}, &model.AssignmentAttachment{}, &model.Submission{}, &model.SubmissionAttachment{}, &model.AuditLogs{})
	return db
}

func cleanupDatabase(db *gorm.DB) {
	db.Exec("DELETE FROM material_attachments")
	db.Exec("DELETE FROM materials")
	db.Exec("DELETE FROM assignment_attachments")
	db.Exec("DELETE FROM assignment_rubrics")
	db.Exec("DELETE FROM submission_files")
	db.Exec("DELETE FROM submission_links")
	db.Exec("DELETE FROM submissions")
	db.Exec("DELETE FROM assignments")
	db.Exec("DELETE FROM announcements")
	db.Exec("DELETE FROM classroom_mahasiswas")
	db.Exec("DELETE FROM classrooms")
	db.Exec("DELETE FROM verification_tokens")
	db.Exec("DELETE FROM users")
}

func setupTestRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	authMiddleware := middleware.NewAuthMiddleware()
	aclMiddleware := middleware.NewAclMiddleware()
	globalErrMiddleware := middleware.NewGlobalErrMiddleware()
	r.Use(globalErrMiddleware.Handle())

	userRepository := repositories.NewUserRepository(db)
	verificationRepository := repositories.NewVerificationRepository(db)
	classroomRepository := repositories.NewClassroomRepository(db)
	assignmentRepository := repositories.NewAssignmentRepository(db)
	submissionRepository := repositories.NewSubmissionRepository(db)

	authService := services.NewAuthService(userRepository, verificationRepository)
	submissionService := services.NewSubmissionService(submissionRepository, assignmentRepository)
	assignmentService := services.NewAssignmentService(assignmentRepository, classroomRepository, submissionService)
	classroomService := services.NewClassroomService(classroomRepository, submissionService, assignmentService)

	authController := controllers.NewAuthController(authService)
	classroomController := controllers.NewClassroomController(classroomService)

	api := r.Group("/lms-usti-api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", authController.Login)
			auth.POST("/activation/resend", authController.ResendActivation)
			auth.POST("/reset-password", authController.SendResetPasswordEmail)
			auth.POST("/new-password", authController.ResetPassword)
			auth.Use(authMiddleware.Handle()).GET("/me", authController.Me)
		}
		classroom := api.Group("/classroom")
		classroom.Use(authMiddleware.Handle())
		{
			classroom.GET("/dosen/classrooms", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.FindAllByDosenId)
			classroom.GET("/mahasiswa/classrooms", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.FindAllByMahasiswaId)
			classroom.POST("/create", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Create)
			classroom.POST("/join", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.Enroll)
			classroom.GET("/:id", classroomController.FindById)
			classroom.GET("/:id/members", classroomController.FindAllClassroomMember)
			classroom.DELETE("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Delete)
			classroom.PUT("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Update)
		}
	}
	return r
}

func seedUser(db *gorm.DB, fullname, email, password, role string) model.User {
	hashedPassword, err := lib.HashPassword(password)
	if err != nil {
		panic("failed to hash password: " + err.Error())
	}
	user := model.User{
		Fullname:       fullname,
		Email:          email,
		Password:       hashedPassword,
		Role:           role,
	}
	result := db.Create(&user)
	if result.Error != nil {
		panic("failed to seed user: " + result.Error.Error())
	}
	return user
}

func seedVerificationToken(db *gorm.DB, email string, expired bool) model.VerificationToken {
	token := model.NewVerificationToken(email)
	if expired {
		token.Expires = time.Now().Add(-1 * time.Hour)
	}
	result := db.Create(&token)
	if result.Error != nil {
		panic("failed to seed verification token: " + result.Error.Error())
	}
	return token
}

type testResponse struct {
	Meta struct {
		Status  int    `json:"status"`
		Message string `json:"message"`
	} `json:"meta"`
	Data json.RawMessage `json:"data"`
}

func makeRequest(r *gin.Engine, method, url, body string, token string) *httptest.ResponseRecorder {
	var req *http.Request
	if body != "" {
		req = httptest.NewRequest(method, url, bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
	} else {
		req = httptest.NewRequest(method, url, nil)
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func parseResponse(w *httptest.ResponseRecorder) testResponse {
	var res testResponse
	json.Unmarshal(w.Body.Bytes(), &res)
	return res
}

// --- Tahap 2: Test Login ---

func TestLogin(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Login berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		seedUser(db, "Test User", "user@test.com", "password123", "MAHASISWA")
		body := `{"email":"user@test.com","password":"password123"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/login", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "login success" {
			t.Errorf("expected 'login success', got '%s'", res.Meta.Message)
		}
		if res.Data == nil || string(res.Data) == "null" {
			t.Errorf("expected access_token in data, got nil")
		}
	})

	t.Run("Login email salah", func(t *testing.T) {
		cleanupDatabase(db)
		seedUser(db, "Test User", "user@test.com", "password123", "MAHASISWA")
		body := `{"email":"wrong@test.com","password":"password123"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/login", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "email atau password salah" {
			t.Errorf("expected 'email atau password salah', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Login password salah", func(t *testing.T) {
		cleanupDatabase(db)
		seedUser(db, "Test User", "user@test.com", "password123", "MAHASISWA")
		body := `{"email":"user@test.com","password":"wrongpassword"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/login", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "email atau password salah" {
			t.Errorf("expected 'email atau password salah', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Login email belum diverifikasi", func(t *testing.T) {
		cleanupDatabase(db)
		hashedPw, _ := lib.HashPassword("password123")
		db.Create(&model.User{Fullname: "Test User", Email: "unverified@test.com", Password: hashedPw, Role: "MAHASISWA"})
		body := `{"email":"unverified@test.com","password":"password123"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/login", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "akun belum diverifikasi" {
			t.Errorf("expected 'akun belum diverifikasi', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Login body kosong", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/login", body, "")
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 4: Test Activation ---

func TestActivateUser(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Aktivasi berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		hashedPw, _ := lib.HashPassword("password123")
		db.Create(&model.User{Fullname: "Test User", Email: "user@test.com", Password: hashedPw, Role: "MAHASISWA"})
		token := seedVerificationToken(db, "user@test.com", false)
		body := `{"token":"` + token.Token + `"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/activation", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "account successfully activated" {
			t.Errorf("expected 'account successfully activated', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Token tidak valid", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{"token":"invalid-token-123"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/activation", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "token tidak valid" {
			t.Errorf("expected 'token tidak valid', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Token expired", func(t *testing.T) {
		cleanupDatabase(db)
		hashedPw, _ := lib.HashPassword("password123")
		db.Create(&model.User{Fullname: "Test User", Email: "user@test.com", Password: hashedPw, Role: "MAHASISWA"})
		token := seedVerificationToken(db, "user@test.com", true)
		body := `{"token":"` + token.Token + `"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/activation", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "token sudah kedaluwarsa" {
			t.Errorf("expected 'token sudah kedaluwarsa', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Body kosong", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/activation", body, "")
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 5: Test Resend Activation ---

func TestResendActivation(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Resend berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		hashedPw, _ := lib.HashPassword("password123")
		db.Create(&model.User{Fullname: "Test User", Email: "user@test.com", Password: hashedPw, Role: "MAHASISWA"})
		body := `{"email":"user@test.com"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/activation/resend", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "email successfully sent" {
			t.Errorf("expected 'email successfully sent', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Email tidak terdaftar", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{"email":"notfound@test.com"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/activation/resend", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "email tidak ditemukan" {
			t.Errorf("expected 'email tidak ditemukan', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Body kosong", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/activation/resend", body, "")
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 6: Test Send Reset Password Email ---

func TestSendResetPasswordEmail(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Reset berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		seedUser(db, "Test User", "user@test.com", "password123", "MAHASISWA")
		body := `{"email":"user@test.com"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/reset-password", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "email successfully sent" {
			t.Errorf("expected 'email successfully sent', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Email tidak terdaftar", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{"email":"notfound@test.com"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/reset-password", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected 404, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "email tidak ditemukan" {
			t.Errorf("expected 'email tidak ditemukan', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Body kosong", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/reset-password", body, "")
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 7: Test New Password ---

func TestNewPassword(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Reset password berhasil", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Test User", "user@test.com", "password123", "MAHASISWA")
		token := seedVerificationToken(db, "user@test.com", false)
		body := `{"token":"` + token.Token + `","old_password":"password123","new_password":"newpassword456"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/new-password", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "password successfully changed" {
			t.Errorf("expected 'password successfully changed', got '%s'", res.Meta.Message)
		}

		var updatedUser model.User
		db.First(&updatedUser, "id = ?", user.ID)
		if lib.IsPasswordMatch(updatedUser.Password, "newpassword456") != true {
			t.Errorf("password should have been updated")
		}
	})

	t.Run("Token tidak valid", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{"token":"invalid-token","old_password":"password123","new_password":"newpassword456"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/new-password", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "token tidak valid" {
			t.Errorf("expected 'token tidak valid', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Token expired", func(t *testing.T) {
		cleanupDatabase(db)
		seedUser(db, "Test User", "user@test.com", "password123", "MAHASISWA")
		token := seedVerificationToken(db, "user@test.com", true)
		body := `{"token":"` + token.Token + `","old_password":"password123","new_password":"newpassword456"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/new-password", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "token sudah kedaluwarsa" {
			t.Errorf("expected 'token sudah kedaluwarsa', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Password lama salah", func(t *testing.T) {
		cleanupDatabase(db)
		seedUser(db, "Test User", "user@test.com", "password123", "MAHASISWA")
		token := seedVerificationToken(db, "user@test.com", false)
		body := `{"token":"` + token.Token + `","old_password":"wrongpassword","new_password":"newpassword456"}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/new-password", body, "")
		res := parseResponse(w)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "email atau password salah" {
			t.Errorf("expected 'email atau password salah', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Body kosong", func(t *testing.T) {
		cleanupDatabase(db)
		body := `{}`
		w := makeRequest(r, "POST", "/lms-usti-api/auth/new-password", body, "")
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}

// --- Tahap 8: Test Me ---

func TestMe(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupTestRouter(db)

	t.Run("Token valid", func(t *testing.T) {
		cleanupDatabase(db)
		user := seedUser(db, "Test User", "user@test.com", "password123", "MAHASISWA")
		token, err := lib.CreateToken(user.Fullname, user.Email, user.Role, user.ID)
		if err != nil {
			t.Fatalf("failed to create token: %v", err)
		}

		w := makeRequest(r, "GET", "/lms-usti-api/auth/me", "", token)
		res := parseResponse(w)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
		if res.Meta.Message != "berhasil mengambil data user" {
			t.Errorf("expected 'berhasil mengambil data user', got '%s'", res.Meta.Message)
		}
	})

	t.Run("Tanpa token", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "GET", "/lms-usti-api/auth/me", "", "")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})

	t.Run("Token tidak valid", func(t *testing.T) {
		cleanupDatabase(db)
		w := makeRequest(r, "GET", "/lms-usti-api/auth/me", "", "invalid-token-123")
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d: %s", w.Code, string(w.Body.Bytes()))
		}
	})
}
