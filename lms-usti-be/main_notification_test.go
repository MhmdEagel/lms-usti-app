package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/MhmdEagel/lms-usti-be/controllers"
	"github.com/MhmdEagel/lms-usti-be/middleware"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/MhmdEagel/lms-usti-be/sse"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupNotificationTestRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	authMiddleware := middleware.NewAuthMiddleware()
	aclMiddleware := middleware.NewAclMiddleware()
	globalErrMiddleware := middleware.NewGlobalErrMiddleware()
	r.Use(globalErrMiddleware.Handle())

	classroomRepo := repositories.NewClassroomRepository(db)
	assignmentRepo := repositories.NewAssignmentRepository(db)
	submissionRepo := repositories.NewSubmissionRepository(db)
	contentViewRepo := repositories.NewContentViewRepository(db)
	commentRepo := repositories.NewCommentRepository(db)
	forumRepo := repositories.NewForumRepository(db)
	notificationRepo := repositories.NewNotificationRepository(db)

	broker := sse.NewBroker()
	notificationService := services.NewNotificationService(notificationRepo, classroomRepo, broker)

	submissionService := services.NewSubmissionService(submissionRepo, assignmentRepo, notificationService)
	assignmentService := services.NewAssignmentService(assignmentRepo, classroomRepo, submissionService, contentViewRepo, notificationService)
	forumService := services.NewForumService(forumRepo, commentRepo, notificationService)

	assignmentController := controllers.NewAssignmentController(assignmentService)
	submissionController := controllers.NewSubmissionController(submissionService)
	forumController := controllers.NewForumController(forumService)
	notificationController := controllers.NewNotificationController(notificationService, broker)

	api := r.Group("/lms-usti-api")
	{
		classroom := api.Group("/classroom")
		classroom.Use(authMiddleware.Handle())
		{
			classroom.POST("/:id/assignments", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Create)
			classroom.PUT("/:id/assignments/:assignmentId/submissions/:submissionId/grade", aclMiddleware.Handle([]string{"DOSEN"}), submissionController.Grade)
		}

		forum := api.Group("/forum")
		forum.Use(authMiddleware.Handle())
		{
			forum.POST("/posts", aclMiddleware.Handle([]string{"DOSEN", "PRODI"}), forumController.CreatePost)
		}

		notifications := api.Group("/notifications")
		notifications.Use(authMiddleware.Handle())
		{
			notifications.GET("", notificationController.FindAll)
			notifications.GET("/unread-count", notificationController.UnreadCount)
			notifications.GET("/stream", notificationController.Stream)
			notifications.PATCH("/read-all", notificationController.MarkAllAsRead)
			notifications.PATCH("/:id/read", notificationController.MarkAsRead)
		}
	}
	return r
}

func waitForNotification(t *testing.T, db *gorm.DB, userId string, notificationType string) model.Notification {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		var notification model.Notification
		err := db.Where("user_id = ? AND type = ?", userId, notificationType).Order("created_at DESC").First(&notification).Error
		if err == nil {
			return notification
		}
		time.Sleep(25 * time.Millisecond)
	}
	t.Fatalf("notification %s for user %s tidak pernah dibuat", notificationType, userId)
	return model.Notification{}
}

func countNotifications(db *gorm.DB, userId string, notificationType string) int64 {
	var total int64
	db.Model(&model.Notification{}).Where("user_id = ? AND type = ?", userId, notificationType).Count(&total)
	return total
}

func TestNotificationAssignmentCreated(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupNotificationTestRouter(db)
	cleanupDatabase(db)

	dosen := seedUser(db, "Dosen Notifikasi", "dosen-notif@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Notifikasi", "mahasiswa-notif@test.com", "password123", "MAHASISWA")
	mahasiswaLuarr := seedUser(db, "Mahasiswa Luar", "mahasiswa-luar-notif@test.com", "password123", "MAHASISWA")
	classroom := seedClassroom(db, dosen.ID, "Kelas Notifikasi")
	seedMahasiswaToClassroom(db, mahasiswa, classroom)

	body := createAssignmentJSON("Tugas Notifikasi", time.Now().Add(24*time.Hour), "Kerjakan soal", nil, nil)
	w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	notification := waitForNotification(t, db, mahasiswa.ID, model.NotificationTypeAssignmentCreated)

	if notification.Title != "Tugas baru: Tugas Notifikasi" {
		t.Errorf("judul notifikasi salah: %s", notification.Title)
	}
	if notification.ClassroomId != classroom.ID {
		t.Errorf("classroom id salah: %s", notification.ClassroomId)
	}
	if notification.AssignmentId == "" {
		t.Error("assignment id kosong")
	}
	if notification.IsRead {
		t.Error("notifikasi baru seharusnya belum dibaca")
	}
	if !strings.Contains(notification.Body, "Kelas Notifikasi") {
		t.Errorf("body tidak memuat nama kelas: %s", notification.Body)
	}
	if got := countNotifications(db, mahasiswaLuarr.ID, model.NotificationTypeAssignmentCreated); got != 0 {
		t.Errorf("mahasiswa yang tidak bergabung seharusnya tidak dinotifikasi, got %d", got)
	}
	if got := countNotifications(db, dosen.ID, model.NotificationTypeAssignmentCreated); got != 0 {
		t.Errorf("dosen pembuat tugas seharusnya tidak dinotifikasi, got %d", got)
	}
}

func TestNotificationSubmissionGraded(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupNotificationTestRouter(db)
	cleanupDatabase(db)

	dosen := seedUser(db, "Dosen Penilai", "dosen-grade-notif@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Dinilai", "mahasiswa-grade-notif@test.com", "password123", "MAHASISWA")
	mahasiswaLain := seedUser(db, "Mahasiswa Lain", "mahasiswa-lain-notif@test.com", "password123", "MAHASISWA")
	classroom := seedClassroom(db, dosen.ID, "Kelas Penilaian")
	seedMahasiswaToClassroom(db, mahasiswa, classroom)
	seedMahasiswaToClassroom(db, mahasiswaLain, classroom)

	body := createAssignmentJSON("Tugas Penilaian", time.Now().Add(24*time.Hour), "Kerjakan soal", nil, nil)
	w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("gagal membuat assignment: %d %s", w.Code, w.Body.String())
	}

	var assignment model.Assignment
	if err := db.Where("classroom_id = ?", classroom.ID).First(&assignment).Error; err != nil {
		t.Fatalf("assignment tidak ditemukan: %v", err)
	}
	var submission model.Submission
	if err := db.Where("assignment_id = ? AND student_id = ?", assignment.ID, mahasiswa.ID).First(&submission).Error; err != nil {
		t.Fatalf("submission tidak ditemukan: %v", err)
	}
	if err := db.Model(&model.Submission{}).Where("id = ?", submission.ID).
		Updates(map[string]any{"status": "submitted", "submission_date": time.Now()}).Error; err != nil {
		t.Fatalf("gagal menandai submission: %v", err)
	}

	gradeBody := `{"score": 88, "feedback": "kerja bagus"}`
	gradePath := fmt.Sprintf("/lms-usti-api/classroom/%s/assignments/%s/submissions/%s/grade", classroom.ID, assignment.ID, submission.ID)
	w = makeRequest(r, "PUT", gradePath, gradeBody, generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("gagal menilai: %d %s", w.Code, w.Body.String())
	}

	notification := waitForNotification(t, db, mahasiswa.ID, model.NotificationTypeSubmissionGraded)

	if !strings.Contains(notification.Body, "88") {
		t.Errorf("body tidak memuat nilai: %s", notification.Body)
	}
	if notification.AssignmentId != assignment.ID {
		t.Errorf("assignment id salah: %s", notification.AssignmentId)
	}
	if notification.ClassroomId != classroom.ID {
		t.Errorf("classroom id salah: %s", notification.ClassroomId)
	}
	if got := countNotifications(db, mahasiswaLain.ID, model.NotificationTypeSubmissionGraded); got != 0 {
		t.Errorf("mahasiswa lain seharusnya tidak dinotifikasi, got %d", got)
	}
}

func TestNotificationForumPostCreated(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupNotificationTestRouter(db)
	cleanupDatabase(db)

	dosen := seedUser(db, "Dosen Forum", "dosen-forum-notif@test.com", "password123", "DOSEN")
	dosenLain := seedUser(db, "Dosen Lain Forum", "dosen-lain-forum-notif@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Forum", "mahasiswa-forum-notif@test.com", "password123", "MAHASISWA")
	prodi := seedUser(db, "Prodi Forum", "prodi-forum-notif@test.com", "password123", "PRODI")
	admin := seedUser(db, "Admin Forum", "admin-forum-notif@test.com", "password123", "ADMIN")

	body := `{"title":"Pengumuman Forum","content":"Isi pengumuman"}`
	w := makeRequest(r, "POST", "/lms-usti-api/forum/posts", body, generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("gagal membuat postingan: %d %s", w.Code, w.Body.String())
	}

	for _, user := range []model.User{dosenLain, mahasiswa, prodi} {
		notification := waitForNotification(t, db, user.ID, model.NotificationTypeForumPostCreated)
		if notification.ForumPostId == "" {
			t.Errorf("forum post id kosong untuk %s", user.Fullname)
		}
		if !strings.Contains(notification.Body, "Pengumuman Forum") {
			t.Errorf("body tidak memuat judul postingan: %s", notification.Body)
		}
	}
	if got := countNotifications(db, dosen.ID, model.NotificationTypeForumPostCreated); got != 0 {
		t.Errorf("penulis postingan seharusnya tidak dinotifikasi, got %d", got)
	}
	if got := countNotifications(db, admin.ID, model.NotificationTypeForumPostCreated); got != 0 {
		t.Errorf("admin seharusnya tidak dinotifikasi, got %d", got)
	}
}

func TestNotificationListAndReadState(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupNotificationTestRouter(db)
	cleanupDatabase(db)

	mahasiswa := seedUser(db, "Mahasiswa Daftar", "mahasiswa-list-notif@test.com", "password123", "MAHASISWA")
	other := seedUser(db, "Mahasiswa Lain Daftar", "mahasiswa-list-lain@test.com", "password123", "MAHASISWA")

	first := model.Notification{
		UserId:      mahasiswa.ID,
		Type:        model.NotificationTypeAssignmentCreated,
		Title:       "Tugas baru: Tugas Satu",
		Body:        "Tugas \"Tugas Satu\" dibuat di kelas Uji Coba.",
		ClassroomId: "classroom-1",
	}
	second := model.Notification{
		UserId:      mahasiswa.ID,
		Type:        model.NotificationTypeSubmissionGraded,
		Title:       "Tugas telah dinilai",
		Body:        "Tugas \"Tugas Satu\" kamu telah dinilai dengan nilai 90.",
		ClassroomId: "classroom-1",
	}
	otherNotification := model.Notification{
		UserId: other.ID,
		Type:   model.NotificationTypeAssignmentCreated,
		Title:  "Tugas baru: Tugas Orang Lain",
	}
	for _, item := range []*model.Notification{&first, &second, &otherNotification} {
		if err := db.Create(item).Error; err != nil {
			t.Fatalf("gagal seed notifikasi: %v", err)
		}
	}

	token := generateToken(mahasiswa)

	w := makeRequest(r, "GET", "/lms-usti-api/notifications?limit=10&page=1", "", token)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	var listResponse struct {
		Data []map[string]any `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &listResponse); err != nil {
		t.Fatalf("gagal parse response: %v", err)
	}
	if len(listResponse.Data) != 2 {
		t.Errorf("expected 2 notifikasi, got %d", len(listResponse.Data))
	}

	w = makeRequest(r, "GET", "/lms-usti-api/notifications/unread-count", "", token)
	var countResponse struct {
		Data struct {
			UnreadCount int64 `json:"unread_count"`
		} `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &countResponse)
	if countResponse.Data.UnreadCount != 2 {
		t.Errorf("expected unread 2, got %d", countResponse.Data.UnreadCount)
	}

	w = makeRequest(r, "PATCH", "/lms-usti-api/notifications/"+first.ID+"/read", "", token)
	if w.Code != http.StatusOK {
		t.Fatalf("mark as read failed: %d %s", w.Code, w.Body.String())
	}
	w = makeRequest(r, "GET", "/lms-usti-api/notifications/unread-count", "", token)
	json.Unmarshal(w.Body.Bytes(), &countResponse)
	if countResponse.Data.UnreadCount != 1 {
		t.Errorf("expected unread 1 setelah dibaca, got %d", countResponse.Data.UnreadCount)
	}

	w = makeRequest(r, "PATCH", "/lms-usti-api/notifications/read-all", "", token)
	if w.Code != http.StatusOK {
		t.Fatalf("mark all as read failed: %d %s", w.Code, w.Body.String())
	}
	w = makeRequest(r, "GET", "/lms-usti-api/notifications/unread-count", "", token)
	json.Unmarshal(w.Body.Bytes(), &countResponse)
	if countResponse.Data.UnreadCount != 0 {
		t.Errorf("expected unread 0 setelah read-all, got %d", countResponse.Data.UnreadCount)
	}

	otherToken := generateToken(other)
	w = makeRequest(r, "PATCH", "/lms-usti-api/notifications/"+first.ID+"/read", "", otherToken)
	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404 saat menandai notifikasi orang lain, got %d", w.Code)
	}
}

func TestNotificationStreamRealtime(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupNotificationTestRouter(db)
	cleanupDatabase(db)

	dosen := seedUser(db, "Dosen Stream", "dosen-stream-notif@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Stream", "mahasiswa-stream-notif@test.com", "password123", "MAHASISWA")

	server := httptest.NewServer(r)
	defer server.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "GET", server.URL+"/lms-usti-api/notifications/stream", nil)
	if err != nil {
		t.Fatalf("gagal membuat request: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+generateToken(mahasiswa))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("gagal membuka stream: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if contentType := resp.Header.Get("Content-Type"); !strings.HasPrefix(contentType, "text/event-stream") {
		t.Fatalf("content type salah: %s", contentType)
	}

	lines := make(chan string)
	go func() {
		scanner := bufio.NewScanner(resp.Body)
		for scanner.Scan() {
			lines <- scanner.Text()
		}
		close(lines)
	}()

	readEvent := func(eventName string) string {
		t.Helper()
		deadline := time.After(10 * time.Second)
		var payload string
		var capture bool
		for {
			select {
			case line, open := <-lines:
				if !open {
					t.Fatalf("stream tertutup sebelum menerima event %s", eventName)
				}
				if strings.HasPrefix(line, "event:") {
					capture = strings.TrimSpace(strings.TrimPrefix(line, "event:")) == eventName
					payload = ""
					continue
				}
				if capture && strings.HasPrefix(line, "data:") {
					payload = strings.TrimSpace(strings.TrimPrefix(line, "data:"))
				}
				if capture && line == "" && payload != "" {
					return payload
				}
			case <-deadline:
				t.Fatalf("timeout menunggu event %s", eventName)
			}
		}
	}

	if got := readEvent("connected"); !strings.Contains(got, "connected") {
		t.Errorf("payload connected salah: %s", got)
	}

	body := `{"title":"Postingan Realtime","content":"halo"}`
	w := makeRequest(r, "POST", "/lms-usti-api/forum/posts", body, generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("gagal membuat postingan: %d %s", w.Code, w.Body.String())
	}

	payload := readEvent("notification")
	if !strings.Contains(payload, "Postingan Realtime") {
		t.Errorf("payload notifikasi tidak berisi judul postingan: %s", payload)
	}
	if !strings.Contains(payload, model.NotificationTypeForumPostCreated) {
		t.Errorf("payload notifikasi tidak berisi tipe: %s", payload)
	}
}
