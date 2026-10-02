package main

import (
	"net/http"
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

func setupNotificationCleanupTestRouter(db *gorm.DB) *gin.Engine {
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
	forumRepo := repositories.NewForumRepository(db)
	commentRepo := repositories.NewCommentRepository(db)
	notificationRepo := repositories.NewNotificationRepository(db)

	broker := sse.NewBroker()
	notificationService := services.NewNotificationService(notificationRepo, classroomRepo, broker)
	submissionService := services.NewSubmissionService(submissionRepo, assignmentRepo, notificationService)
	assignmentService := services.NewAssignmentService(assignmentRepo, classroomRepo, submissionService, contentViewRepo, notificationService)
	forumService := services.NewForumService(forumRepo, commentRepo, notificationService)

	assignmentController := controllers.NewAssignmentController(assignmentService)
	forumController := controllers.NewForumController(forumService)

	api := r.Group("/lms-usti-api")
	{
		classroom := api.Group("/classroom")
		classroom.Use(authMiddleware.Handle())
		{
			classroom.POST("/:id/assignments", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Create)
			classroom.DELETE("/:id/assignments/:assignmentId", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.Delete)
		}

		forum := api.Group("/forum")
		forum.Use(authMiddleware.Handle())
		{
			forum.POST("/posts", aclMiddleware.Handle([]string{"DOSEN", "PRODI"}), forumController.CreatePost)
			forum.DELETE("/posts/:postId", aclMiddleware.Handle([]string{"DOSEN", "MAHASISWA", "PRODI"}), forumController.DeletePost)
		}
	}
	return r
}

func waitForNotificationCount(t *testing.T, db *gorm.DB, field, value string, want int64) {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		var total int64
		if err := db.Model(&model.Notification{}).Where(field+" = ?", value).Count(&total).Error; err != nil {
			t.Fatalf("gagal menghitung notifikasi: %v", err)
		}
		if total == want {
			return
		}
		time.Sleep(25 * time.Millisecond)
	}
	var final int64
	db.Model(&model.Notification{}).Where(field+" = ?", value).Count(&final)
	t.Fatalf("count notifikasi %s=%s tidak pernah menjadi %d (akhir: %d)", field, value, want, final)
}

func TestNotificationDeletedWhenForumPostDeleted(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupNotificationCleanupTestRouter(db)
	cleanupDatabase(db)

	dosen := seedUser(db, "Dosen Hapus Forum", "dosen-hapus-forum@test.com", "password123", "DOSEN")
	dosenLain := seedUser(db, "Dosen Lain Hapus Forum", "dosen-lain-hapus-forum@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Hapus Forum", "mahasiswa-hapus-forum@test.com", "password123", "MAHASISWA")

	unrelated := model.Notification{
		UserId:      mahasiswa.ID,
		Type:        model.NotificationTypeForumPostCreated,
		Title:       "Postingan forum lain",
		ForumPostId: "forum-post-lain",
	}
	if err := db.Create(&unrelated).Error; err != nil {
		t.Fatalf("gagal seed notifikasi lain: %v", err)
	}

	body := `{"title":"Segera Dihapus","content":"isi postingan"}`
	w := makeRequest(r, "POST", "/lms-usti-api/forum/posts", body, generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("gagal membuat postingan: %d %s", w.Code, w.Body.String())
	}

	var post model.ForumPost
	if err := db.Where("title = ?", "Segera Dihapus").Order("created_at DESC").First(&post).Error; err != nil {
		t.Fatalf("postingan tidak ditemukan: %v", err)
	}

	waitForNotificationCount(t, db, "forum_post_id", post.ID, 2)
	waitForNotificationCount(t, db, "forum_post_id", "forum-post-lain", 1)

	w = makeRequest(r, "DELETE", "/lms-usti-api/forum/posts/"+post.ID, "", generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("gagal menghapus postingan: %d %s", w.Code, w.Body.String())
	}

	waitForNotificationCount(t, db, "forum_post_id", post.ID, 0)
	waitForNotificationCount(t, db, "forum_post_id", "forum-post-lain", 1)

	if got := countNotifications(db, mahasiswa.ID, model.NotificationTypeForumPostCreated); got != 1 {
		t.Errorf("hanya notifikasi postingan lain yang boleh tersisa, got %d", got)
	}
	if got := countNotifications(db, dosenLain.ID, model.NotificationTypeForumPostCreated); got != 0 {
		t.Errorf("notifikasi postingan terhapus seharusnya ikut hilang, got %d", got)
	}
}

func TestNotificationDeletedWhenAssignmentDeleted(t *testing.T) {
	db := setupTestDB()
	defer cleanupDatabase(db)
	r := setupNotificationCleanupTestRouter(db)
	cleanupDatabase(db)

	dosen := seedUser(db, "Dosen Hapus Tugas", "dosen-hapus-tugas@test.com", "password123", "DOSEN")
	mahasiswa := seedUser(db, "Mahasiswa Hapus Tugas", "mahasiswa-hapus-tugas@test.com", "password123", "MAHASISWA")
	classroom := seedClassroom(db, dosen.ID, "Kelas Hapus Tugas")
	seedMahasiswaToClassroom(db, mahasiswa, classroom)

	for _, title := range []string{"Tugas Dihapus", "Tugas Bertahan"} {
		body := createAssignmentJSON(title, time.Now().Add(24*time.Hour), "Kerjakan soal", nil, nil)
		w := makeRequest(r, "POST", "/lms-usti-api/classroom/"+classroom.ID+"/assignments", body, generateToken(dosen))
		if w.Code != http.StatusOK {
			t.Fatalf("gagal membuat assignment %s: %d %s", title, w.Code, w.Body.String())
		}
	}

	var assignmentDihapus model.Assignment
	if err := db.Where("title = ?", "Tugas Dihapus").Order("created_at DESC").First(&assignmentDihapus).Error; err != nil {
		t.Fatalf("assignment tidak ditemukan: %v", err)
	}
	var assignmentBertahan model.Assignment
	if err := db.Where("title = ?", "Tugas Bertahan").Order("created_at DESC").First(&assignmentBertahan).Error; err != nil {
		t.Fatalf("assignment tidak ditemukan: %v", err)
	}

	waitForNotificationCount(t, db, "assignment_id", assignmentDihapus.ID, 1)
	waitForNotificationCount(t, db, "assignment_id", assignmentBertahan.ID, 1)

	w := makeRequest(r, "DELETE", "/lms-usti-api/classroom/"+classroom.ID+"/assignments/"+assignmentDihapus.ID, "", generateToken(dosen))
	if w.Code != http.StatusOK {
		t.Fatalf("gagal menghapus assignment: %d %s", w.Code, w.Body.String())
	}

	waitForNotificationCount(t, db, "assignment_id", assignmentDihapus.ID, 0)
	waitForNotificationCount(t, db, "assignment_id", assignmentBertahan.ID, 1)

	if got := countNotifications(db, mahasiswa.ID, model.NotificationTypeAssignmentCreated); got != 1 {
		t.Errorf("hanya notifikasi tugas tersisa, got %d", got)
	}
}
