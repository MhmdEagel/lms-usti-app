package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/MhmdEagel/lms-usti-be/controllers"
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/middleware"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/MhmdEagel/lms-usti-be/websocket"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Chat tables are not part of setupTestDB's AutoMigrate list nor
// cleanupDatabase's table list, so this file migrates and cleans them itself.
func setupClassroomChatTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db := setupTestDB()
	if err := db.AutoMigrate(&model.Conversation{}, &model.ConversationParticipant{}, &model.Message{}, &model.MessageReadBy{}); err != nil {
		t.Fatalf("gagal migrate tabel chat: %v", err)
	}
	cleanupDatabase(db)
	resetChatTables(db)
	return db
}

func resetChatTables(db *gorm.DB) {
	db.Exec("SET FOREIGN_KEY_CHECKS = 0")
	db.Session(&gorm.Session{AllowGlobalUpdate: true}).Unscoped().Delete(&model.MessageReadBy{})
	db.Session(&gorm.Session{AllowGlobalUpdate: true}).Unscoped().Delete(&model.Message{})
	db.Session(&gorm.Session{AllowGlobalUpdate: true}).Unscoped().Delete(&model.ConversationParticipant{})
	db.Session(&gorm.Session{AllowGlobalUpdate: true}).Unscoped().Delete(&model.Conversation{})
	db.Exec("SET FOREIGN_KEY_CHECKS = 1")
}

func teardownClassroomChatTest(db *gorm.DB) {
	cleanupDatabase(db)
	resetChatTables(db)
}

func setupClassroomChatTestRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.Use(middleware.NewGlobalErrMiddleware().Handle())

	authMiddleware := middleware.NewAuthMiddleware()
	aclMiddleware := middleware.NewAclMiddleware()

	userRepo := repositories.NewUserRepository(db)
	classroomRepo := repositories.NewClassroomRepository(db)
	assignmentRepo := repositories.NewAssignmentRepository(db)
	submissionRepo := repositories.NewSubmissionRepository(db)
	contentViewRepo := repositories.NewContentViewRepository(db)
	conversationRepo := repositories.NewConversationRepository(db)
	messageRepo := repositories.NewMessageRepository(db)
	classroomPolicyRepo := repositories.NewClassroomPolicyRepository(db)

	submissionService := services.NewSubmissionService(submissionRepo, assignmentRepo, nil)
	assignmentService := services.NewAssignmentService(assignmentRepo, classroomRepo, submissionService, contentViewRepo, nil)
	classroomChatService := services.NewClassroomChatService(classroomRepo, conversationRepo)
	classroomService := services.NewClassroomService(classroomRepo, userRepo, submissionService, assignmentService, classroomPolicyRepo, classroomChatService)
	chatService := services.NewChatService(conversationRepo, messageRepo, userRepo)
	hub := websocket.NewHub(chatService)

	classroomController := controllers.NewClassroomController(classroomService)
	chatController := controllers.NewChatController(chatService, hub)

	api := r.Group("/lms-usti-api")
	{
		classroom := api.Group("/classroom")
		classroom.Use(authMiddleware.Handle())
		{
			classroom.POST("/create", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Create)
			classroom.POST("/join", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.Enroll)
			classroom.DELETE("/:id/members/:memberId", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.RemoveMember)
			classroom.DELETE("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Delete)
		}
		chat := api.Group("/chat")
		chat.Use(authMiddleware.Handle())
		{
			chat.GET("/conversations", chatController.GetConversations)
			chat.GET("/conversations/:id/messages", chatController.GetMessages)
			chat.POST("/conversations/:id/messages", chatController.SendMessage)
		}
	}
	return r
}

func createClassroomViaAPI(t *testing.T, r *gin.Engine, db *gorm.DB, token, className string) model.Classroom {
	t.Helper()
	body := fmt.Sprintf(
		`{"class_name":"%s","class_cover":"https://example.com/cover.jpg","term":1,"room_number":101,"day":2,"class_start":"2026-01-01T08:00:00Z","class_end":"2026-01-01T10:00:00Z","prodi":"TI","tahun_ajaran":"2025/2026"}`,
		className,
	)
	w := makeRequest(r, "POST", "/lms-usti-api/classroom/create", body, token)
	if w.Code != http.StatusOK {
		t.Fatalf("create kelas gagal (%d): %s", w.Code, w.Body.String())
	}
	var classroom model.Classroom
	if err := db.Where("class_name = ?", className).Order("created_at DESC").First(&classroom).Error; err != nil {
		t.Fatalf("kelas %q tidak ditemukan: %v", className, err)
	}
	return classroom
}

func listConversationsViaAPI(t *testing.T, r *gin.Engine, token string) []data.ConversationResponse {
	t.Helper()
	w := makeRequest(r, "GET", "/lms-usti-api/chat/conversations", "", token)
	if w.Code != http.StatusOK {
		t.Fatalf("get conversations gagal (%d): %s", w.Code, w.Body.String())
	}
	res := parseResponse(w)
	var conversations []data.ConversationResponse
	if err := json.Unmarshal(res.Data, &conversations); err != nil {
		t.Fatalf("gagal parse conversations: %v", err)
	}
	return conversations
}

func findClassroomGroup(t *testing.T, db *gorm.DB, classroomID string) (model.Conversation, bool) {
	t.Helper()
	var conversation model.Conversation
	err := db.Preload("Participants").Where("classroom_id = ?", classroomID).First(&conversation).Error
	if err == gorm.ErrRecordNotFound {
		return model.Conversation{}, false
	}
	if err != nil {
		t.Fatalf("gagal mencari group kelas: %v", err)
	}
	return conversation, true
}

func participantIDs(conversation model.Conversation) map[string]bool {
	ids := make(map[string]bool)
	for _, participant := range conversation.Participants {
		ids[participant.UserID] = true
	}
	return ids
}

func countRows(t *testing.T, db *gorm.DB, table string) int64 {
	t.Helper()
	var count int64
	if err := db.Table(table).Count(&count).Error; err != nil {
		t.Fatalf("gagal menghitung %s: %v", table, err)
	}
	return count
}

func TestClassroomGroupCreatedOnClassroomCreate(t *testing.T) {
	db := setupClassroomChatTestDB(t)
	defer teardownClassroomChatTest(db)
	r := setupClassroomChatTestRouter(db)

	dosen := seedUser(db, "Dosen Group Chat", "dosen-groupchat@test.com", "password123", "DOSEN")
	prodi := seedUser(db, "Prodi Group Chat", "prodi-groupchat@test.com", "password123", "PRODI")

	classroom := createClassroomViaAPI(t, r, db, generateToken(dosen), "Struktur Data Lanjut")

	group, exists := findClassroomGroup(t, db, classroom.ID)
	if !exists {
		t.Fatal("group chat kelas seharusnya dibuat saat kelas dibuat")
	}
	if group.Type != "group" {
		t.Errorf("type group salah: %s", group.Type)
	}
	if group.Name != classroom.ClassName {
		t.Errorf("nama group harus sama dengan nama kelas, got %q", group.Name)
	}
	if group.ClassroomId == nil || *group.ClassroomId != classroom.ID {
		t.Errorf("classroom_id group salah: %v", group.ClassroomId)
	}

	ids := participantIDs(group)
	if len(ids) != 1 || !ids[dosen.ID] {
		t.Errorf("participant group harus hanya dosen pemilik, got %v", ids)
	}
	if ids[prodi.ID] {
		t.Error("PRODI seharusnya bukan participant group")
	}

	// Satu kelas = satu group: pembuatan berulang tidak menggandakan.
	var conversationCount int64
	if err := db.Model(&model.Conversation{}).Where("classroom_id = ?", classroom.ID).Count(&conversationCount).Error; err != nil {
		t.Fatalf("gagal menghitung group: %v", err)
	}
	if conversationCount != 1 {
		t.Errorf("expected 1 group per kelas, got %d", conversationCount)
	}

	// Dosen melihat group di Percakapan tanpa langkah manual.
	conversations := listConversationsViaAPI(t, r, generateToken(dosen))
	if len(conversations) != 1 {
		t.Fatalf("dosen seharusnya melihat 1 percakapan, got %d", len(conversations))
	}
	if conversations[0].ClassroomId == nil || *conversations[0].ClassroomId != classroom.ID {
		t.Errorf("conversation di percakapan tidak membawa classroom_id: %v", conversations[0].ClassroomId)
	}

	// PRODI bukan participant → tidak muncul di list percakapan.
	if prodiConversations := listConversationsViaAPI(t, r, generateToken(prodi)); len(prodiConversations) != 0 {
		t.Errorf("PRODI seharusnya tidak melihat group kelas, got %d", len(prodiConversations))
	}
}

func TestClassroomGroupMembershipOnJoinAndRemoval(t *testing.T) {
	db := setupClassroomChatTestDB(t)
	defer teardownClassroomChatTest(db)
	r := setupClassroomChatTestRouter(db)

	dosen := seedUser(db, "Dosen Join Chat", "dosen-joinchat@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Join Chat", "mahasiswa-joinchat@test.com", "password123", "MAHASISWA")
	classroom := createClassroomViaAPI(t, r, db, generateToken(dosen), "Basis Data Semester")

	w := makeRequest(r, "POST", "/lms-usti-api/classroom/join",
		fmt.Sprintf(`{"class_code":"%s"}`, classroom.ClassCode), generateToken(mahasiswa))
	if w.Code != http.StatusOK {
		t.Fatalf("join kelas gagal (%d): %s", w.Code, w.Body.String())
	}

	group, exists := findClassroomGroup(t, db, classroom.ID)
	if !exists {
		t.Fatal("group chat tidak ditemukan setelah join")
	}
	ids := participantIDs(group)
	if !ids[mahasiswa.ID] || !ids[dosen.ID] || len(ids) != 2 {
		t.Errorf("participant setelah join salah: %v", ids)
	}

	conversations := listConversationsViaAPI(t, r, generateToken(mahasiswa))
	if len(conversations) != 1 {
		t.Fatalf("mahasiswa seharusnya melihat 1 percakapan setelah join, got %d", len(conversations))
	}
	if conversations[0].ClassroomId == nil || *conversations[0].ClassroomId != classroom.ID {
		t.Errorf("group di percakapan mahasiswa tidak membawa classroom_id: %v", conversations[0].ClassroomId)
	}

	// Join berulang tidak menduplikasi group.
	w = makeRequest(r, "POST", "/lms-usti-api/classroom/join",
		fmt.Sprintf(`{"class_code":"%s"}`, classroom.ClassCode), generateToken(mahasiswa))
	if w.Code == http.StatusOK {
		t.Error("join dua kali seharusnya ditolak")
	}
	var conversationCount int64
	if err := db.Model(&model.Conversation{}).Where("classroom_id = ?", classroom.ID).Count(&conversationCount).Error; err != nil {
		t.Fatalf("gagal menghitung group: %v", err)
	}
	if conversationCount != 1 {
		t.Errorf("join berulang tidak boleh membuat group baru, got %d", conversationCount)
	}

	// Pengeluaran anggota menghapus akses ke group.
	w = makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/members/"+mahasiswa.ID, "", generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("remove member gagal (%d): %s", w.Code, w.Body.String())
	}
	group, exists = findClassroomGroup(t, db, classroom.ID)
	if !exists {
		t.Fatal("group chat ikut terhapus saat anggota dikeluarkan")
	}
	ids = participantIDs(group)
	if ids[mahasiswa.ID] {
		t.Error("mahasiswa yang dikeluarkan seharusnya bukan participant group lagi")
	}
	if !ids[dosen.ID] {
		t.Error("dosen pemilik seharusnya tetap participant")
	}
	if removedConversations := listConversationsViaAPI(t, r, generateToken(mahasiswa)); len(removedConversations) != 0 {
		t.Errorf("mahasiswa yang dikeluarkan seharusnya tidak melihat group, got %d", len(removedConversations))
	}
}

func TestClassroomGroupNotAccessibleForNonParticipant(t *testing.T) {
	db := setupClassroomChatTestDB(t)
	defer teardownClassroomChatTest(db)
	r := setupClassroomChatTestRouter(db)

	dosen := seedUser(db, "Dosen Akses Chat", "dosen-akseschat@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Akses Chat", "mahasiswa-akseschat@test.com", "password123", "MAHASISWA")
	outsider := seedUser(db, "Mahasiswa Luar Chat", "mahasiswa-luarchat@test.com", "password123", "MAHASISWA")
	classroom := createClassroomViaAPI(t, r, db, generateToken(dosen), "Jaringan Komputer")

	w := makeRequest(r, "POST", "/lms-usti-api/classroom/join",
		fmt.Sprintf(`{"class_code":"%s"}`, classroom.ClassCode), generateToken(mahasiswa))
	if w.Code != http.StatusOK {
		t.Fatalf("join kelas gagal (%d): %s", w.Code, w.Body.String())
	}

	group, _ := findClassroomGroup(t, db, classroom.ID)

	if outsiderConversations := listConversationsViaAPI(t, r, generateToken(outsider)); len(outsiderConversations) != 0 {
		t.Errorf("non-member tidak boleh melihat group, got %d", len(outsiderConversations))
	}

	w = makeRequest(r, "GET", "/lms-usti-api/chat/conversations/"+group.ID+"/messages", "", generateToken(outsider))
	if w.Code != http.StatusUnauthorized {
		t.Errorf("non-member membaca group seharusnya 401, got %d: %s", w.Code, w.Body.String())
	}

	w = makeRequest(r, "POST", "/lms-usti-api/chat/conversations/"+group.ID+"/messages",
		`{"content":"pesan ilegal"}`, generateToken(outsider))
	if w.Code != http.StatusUnauthorized {
		t.Errorf("non-member mengirim pesan ke group seharusnya 401, got %d: %s", w.Code, w.Body.String())
	}

	// Participant tetap bisa baca dan kirim.
	w = makeRequest(r, "GET", "/lms-usti-api/chat/conversations/"+group.ID+"/messages", "", generateToken(mahasiswa))
	if w.Code != http.StatusOK {
		t.Errorf("participant membaca group seharusnya 200, got %d: %s", w.Code, w.Body.String())
	}
	w = makeRequest(r, "POST", "/lms-usti-api/chat/conversations/"+group.ID+"/messages",
		`{"content":"halo kelas"}`, generateToken(mahasiswa))
	if w.Code != http.StatusOK {
		t.Errorf("participant mengirim pesan ke group seharusnya 200, got %d: %s", w.Code, w.Body.String())
	}
}

func TestClassroomGroupDeletedWithClassroom(t *testing.T) {
	db := setupClassroomChatTestDB(t)
	defer teardownClassroomChatTest(db)
	r := setupClassroomChatTestRouter(db)

	dosen := seedUser(db, "Dosen Hapus Chat", "dosen-hapuschat@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Hapus Chat", "mahasiswa-hapuschat@test.com", "password123", "MAHASISWA")
	classroom := createClassroomViaAPI(t, r, db, generateToken(dosen), "Sistem Operasi")

	w := makeRequest(r, "POST", "/lms-usti-api/classroom/join",
		fmt.Sprintf(`{"class_code":"%s"}`, classroom.ClassCode), generateToken(mahasiswa))
	if w.Code != http.StatusOK {
		t.Fatalf("join kelas gagal (%d): %s", w.Code, w.Body.String())
	}

	group, _ := findClassroomGroup(t, db, classroom.ID)
	w = makeRequest(r, "POST", "/lms-usti-api/chat/conversations/"+group.ID+"/messages",
		`{"content":"pesan sebelum kelas dihapus"}`, generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("kirim pesan gagal (%d): %s", w.Code, w.Body.String())
	}
	if got := countRows(t, db, "messages"); got != 1 {
		t.Fatalf("expected 1 pesan sebelum delete, got %d", got)
	}
	var message model.Message
	if err := db.First(&message).Error; err != nil {
		t.Fatalf("pesan tidak ditemukan: %v", err)
	}
	if err := db.Create(&model.MessageReadBy{
		MessageID: message.ID,
		UserID:    mahasiswa.ID,
		ReadAt:    time.Now(),
	}).Error; err != nil {
		t.Fatalf("gagal membuat read receipt: %v", err)
	}
	if got := countRows(t, db, "message_read_bies"); got != 1 {
		t.Fatalf("expected 1 read receipt sebelum delete, got %d", got)
	}

	w = makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID, "", generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("hapus kelas gagal (%d): %s", w.Code, w.Body.String())
	}

	_, existsAfter := findClassroomGroup(t, db, classroom.ID)
	if existsAfter {
		t.Error("group chat seharusnya ikut terhapus saat kelas dihapus")
	}
	if got := countRows(t, db, "conversation_participants"); got != 0 {
		t.Errorf("participant group seharusnya ikut terhapus, got %d", got)
	}
	if got := countRows(t, db, "messages"); got != 0 {
		t.Errorf("pesan group seharusnya ikut terhapus, got %d", got)
	}
	if got := countRows(t, db, "message_read_bies"); got != 0 {
		t.Errorf("read receipt seharusnya ikut terhapus, got %d", got)
	}
	if conversations := listConversationsViaAPI(t, r, generateToken(mahasiswa)); len(conversations) != 0 {
		t.Errorf("mahasiswa seharusnya tidak lagi melihat group yang dihapus, got %d", len(conversations))
	}
}

func TestClassroomGroupBackfillForExistingClassrooms(t *testing.T) {
	db := setupClassroomChatTestDB(t)
	defer teardownClassroomChatTest(db)

	dosen := seedUser(db, "Dosen Backfill Chat", "dosen-backfillchat@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Backfill Chat", "mahasiswa-backfillchat@test.com", "password123", "MAHASISWA")
	classroomLama := seedClassroom(db, dosen.ID, "Kelas Lama Tanpa Group")
	seedMahasiswaToClassroom(db, mahasiswa, classroomLama)

	classroomRepo := repositories.NewClassroomRepository(db)
	conversationRepo := repositories.NewConversationRepository(db)
	chatService := services.NewClassroomChatService(classroomRepo, conversationRepo)

	if err := chatService.BackfillClassroomGroups(); err != nil {
		t.Fatalf("backfill gagal: %v", err)
	}

	group, exists := findClassroomGroup(t, db, classroomLama.ID)
	if !exists {
		t.Fatal("kelas lama seharusnya mendapat group setelah backfill")
	}
	if group.Name != classroomLama.ClassName {
		t.Errorf("nama group backfill salah: %q", group.Name)
	}
	ids := participantIDs(group)
	if !ids[dosen.ID] || !ids[mahasiswa.ID] || len(ids) != 2 {
		t.Errorf("participant group backfill salah: %v", ids)
	}

	// Backfill berulang idempoten.
	if err := chatService.BackfillClassroomGroups(); err != nil {
		t.Fatalf("backfill kedua gagal: %v", err)
	}
	var conversationCount int64
	if err := db.Model(&model.Conversation{}).Count(&conversationCount).Error; err != nil {
		t.Fatalf("gagal menghitung conversation: %v", err)
	}
	if conversationCount != 1 {
		t.Errorf("backfill berulang tidak boleh menduplikasi group, got %d conversation", conversationCount)
	}
}
