package main

import (
	"encoding/json"
	"net/http"
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

func setupBroadcastTestRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	authMiddleware := middleware.NewAuthMiddleware()
	aclMiddleware := middleware.NewAclMiddleware()
	globalErrMiddleware := middleware.NewGlobalErrMiddleware()
	r.Use(globalErrMiddleware.Handle())

	classroomRepo := repositories.NewClassroomRepository(db)
	notificationRepo := repositories.NewNotificationRepository(db)
	conversationRepo := repositories.NewConversationRepository(db)
	messageRepo := repositories.NewMessageRepository(db)
	userRepo := repositories.NewUserRepository(db)

	broker := sse.NewBroker()
	notificationService := services.NewNotificationService(notificationRepo, classroomRepo, broker)
	classroomChatService := services.NewClassroomChatService(classroomRepo, conversationRepo)
	chatService := services.NewChatService(conversationRepo, messageRepo, userRepo)
	broadcastService := services.NewBroadcastService(classroomRepo, classroomChatService, chatService, nil, notificationService)
	broadcastController := controllers.NewBroadcastController(broadcastService)

	api := r.Group("/lms-usti-api")
	{
		classroom := api.Group("/classroom")
		classroom.Use(authMiddleware.Handle())
		{
			classroom.POST("/:id/broadcast", aclMiddleware.Handle([]string{"DOSEN"}), broadcastController.Send)
		}
	}
	return r
}

func TestClassroomBroadcastSendsToEnrolledStudents(t *testing.T) {
	db := setupClassroomChatTestDB(t)
	defer teardownClassroomChatTest(db)
	r := setupBroadcastTestRouter(db)

	dosen := seedUser(db, "Dosen Broadcast", "dosen-broadcast@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Broadcast", "mahasiswa-broadcast@test.com", "password123", "MAHASISWA")
	mahasiswaLuar := seedUser(db, "Mahasiswa Luar Broadcast", "mahasiswa-luar-broadcast@test.com", "password123", "MAHASISWA")
	classroom := seedClassroom(db, dosen.ID, "Kelas Broadcast")
	seedMahasiswaToClassroom(db, mahasiswa, classroom)

	body := `{"title":"Perubahan Jadwal","content":"Kelas dipindah ke ruang 303"}`
	w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/broadcast", body, generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var res testResponse
	if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
		t.Fatalf("gagal parse response: %v", err)
	}
	var payload struct {
		RecipientCount int64 `json:"recipient_count"`
	}
	if err := json.Unmarshal(res.Data, &payload); err != nil {
		t.Fatalf("gagal parse data: %v", err)
	}
	if payload.RecipientCount != 1 {
		t.Errorf("expected 1 penerima, got %d", payload.RecipientCount)
	}

	notification := waitForNotification(t, db, mahasiswa.ID, model.NotificationTypeClassroomBroadcast)

	if notification.Title != "Broadcast: Perubahan Jadwal" {
		t.Errorf("judul notifikasi salah: %s", notification.Title)
	}
	if notification.ClassroomId != classroom.ID {
		t.Errorf("classroom id salah: %s", notification.ClassroomId)
	}
	if notification.IsRead {
		t.Error("notifikasi baru seharusnya belum dibaca")
	}
	if !containsAll(notification.Body, "Dosen Broadcast", "Kelas Broadcast", "Kelas dipindah ke ruang 303") {
		t.Errorf("body tidak lengkap: %s", notification.Body)
	}
	if got := countNotifications(db, mahasiswaLuar.ID, model.NotificationTypeClassroomBroadcast); got != 0 {
		t.Errorf("mahasiswa yang tidak bergabung seharusnya tidak dinotifikasi, got %d", got)
	}
	if got := countNotifications(db, dosen.ID, model.NotificationTypeClassroomBroadcast); got != 0 {
		t.Errorf("pengirim seharusnya tidak dinotifikasi, got %d", got)
	}
}

func TestClassroomBroadcastForbiddenForNonOwner(t *testing.T) {
	db := setupClassroomChatTestDB(t)
	defer teardownClassroomChatTest(db)
	r := setupBroadcastTestRouter(db)

	dosen := seedUser(db, "Dosen Pemilik", "dosen-pemilik-broadcast@test.com", "password123", "DOSEN")
	dosenLain := seedUser(db, "Dosen Lain", "dosen-lain-broadcast@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Kirim", "mahasiswa-kirim-broadcast@test.com", "password123", "MAHASISWA")
	classroom := seedClassroom(db, dosen.ID, "Kelas Pemilik Broadcast")
	seedMahasiswaToClassroom(db, mahasiswa, classroom)

	body := `{"title":"Pesan Ilegal","content":"Bukan kelas saya"}`

	w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/broadcast", body, generateToken(dosenLain))
	if w.Code != http.StatusForbidden {
		t.Errorf("expected 403 untuk dosen non pemilik, got %d: %s", w.Code, w.Body.String())
	}
	res := parseResponse(w)
	if res.Meta.Message != "anda bukan pemilik kelas ini" {
		t.Errorf("pesan error salah: %s", res.Meta.Message)
	}

	w = makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/broadcast", body, generateToken(mahasiswa))
	if w.Code != http.StatusForbidden {
		t.Errorf("expected 403 untuk mahasiswa, got %d: %s", w.Code, w.Body.String())
	}

	if got := countNotifications(db, mahasiswa.ID, model.NotificationTypeClassroomBroadcast); got != 0 {
		t.Errorf("tidak boleh ada notifikasi broadcast, got %d", got)
	}
	if got := countNotifications(db, dosenLain.ID, model.NotificationTypeClassroomBroadcast); got != 0 {
		t.Errorf("tidak boleh ada notifikasi broadcast, got %d", got)
	}
}

func TestClassroomBroadcastEmptyAndArchivedClassroom(t *testing.T) {
	db := setupClassroomChatTestDB(t)
	defer teardownClassroomChatTest(db)
	r := setupBroadcastTestRouter(db)

	dosen := seedUser(db, "Dosen Kosong", "dosen-kosong-broadcast@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Arsip", "mahasiswa-arsip-broadcast@test.com", "password123", "MAHASISWA")
	kelasKosong := seedClassroom(db, dosen.ID, "Kelas Tanpa Mahasiswa")

	body := `{"title":"Pesan Kosong","content":"Tidak ada penerima"}`
	w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+kelasKosong.ID+"/broadcast", body, generateToken(dosen))
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 untuk kelas tanpa mahasiswa, got %d: %s", w.Code, w.Body.String())
	}
	if res := parseResponse(w); res.Meta.Message != "belum ada mahasiswa yang bergabung di kelas ini" {
		t.Errorf("pesan error salah: %s", res.Meta.Message)
	}

	kelasArsip := seedClassroom(db, dosen.ID, "Kelas Diarsipkan")
	seedMahasiswaToClassroom(db, mahasiswa, kelasArsip)
	if err := db.Model(&model.Classroom{}).Where("id = ?", kelasArsip.ID).Update("is_archived", true).Error; err != nil {
		t.Fatalf("gagal mengarsipkan kelas: %v", err)
	}

	w = makeRequest(r, "POST", "/lms-usti-api/classroom/"+kelasArsip.ID+"/broadcast", body, generateToken(dosen))
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 untuk kelas terarsip, got %d: %s", w.Code, w.Body.String())
	}
	if res := parseResponse(w); res.Meta.Message != "kelas sudah diarsipkan" {
		t.Errorf("pesan error salah: %s", res.Meta.Message)
	}

	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if countNotifications(db, mahasiswa.ID, model.NotificationTypeClassroomBroadcast) > 0 {
			t.Error("kelas terarsip seharusnya tidak mengirim notifikasi")
			return
		}
		time.Sleep(25 * time.Millisecond)
	}
}

func TestClassroomBroadcastPostsToGroupChat(t *testing.T) {
	db := setupClassroomChatTestDB(t)
	defer teardownClassroomChatTest(db)
	r := setupBroadcastTestRouter(db)

	dosen := seedUser(db, "Dosen Chat Broadcast", "dosen-chatbroadcast@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Chat Broadcast", "mahasiswa-chatbroadcast@test.com", "password123", "MAHASISWA")
	classroom := seedClassroom(db, dosen.ID, "Kelas Chat Broadcast")
	seedMahasiswaToClassroom(db, mahasiswa, classroom)

	body := `{"title":"Perubahan Ruang","content":"Kelas dipindah ke ruang 303"}`
	w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/broadcast", body, generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	notification := waitForNotification(t, db, mahasiswa.ID, model.NotificationTypeClassroomBroadcast)
	if notification.ConversationId == "" {
		t.Fatal("notifikasi broadcast seharusnya membawa conversation_id group chat")
	}

	var group model.Conversation
	if err := db.Where("classroom_id = ?", classroom.ID).First(&group).Error; err != nil {
		t.Fatalf("group chat kelas tidak ditemukan: %v", err)
	}
	if notification.ConversationId != group.ID {
		t.Errorf("conversation_id notifikasi salah: %s (expected %s)", notification.ConversationId, group.ID)
	}

	var message model.Message
	deadline := time.Now().Add(5 * time.Second)
	var lastErr error
	for time.Now().Before(deadline) {
		lastErr = db.Where("conversation_id = ?", group.ID).First(&message).Error
		if lastErr == nil {
			break
		}
		time.Sleep(25 * time.Millisecond)
	}
	if lastErr != nil {
		t.Fatalf("broadcast seharusnya diposting sebagai pesan di group chat: %v", lastErr)
	}
	if message.SenderID != dosen.ID {
		t.Errorf("pesan broadcast harus dari dosen pemilik, got %s", message.SenderID)
	}
	expected := "Perubahan Ruang\n\nKelas dipindah ke ruang 303"
	if message.Content != expected {
		t.Errorf("isi pesan broadcast salah: %q", message.Content)
	}
}

func containsAll(text string, parts ...string) bool {
	for _, part := range parts {
		if !strings.Contains(text, part) {
			return false
		}
	}
	return true
}
