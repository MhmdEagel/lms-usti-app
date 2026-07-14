package router

import (
	"github.com/MhmdEagel/lms-usti-be/config"
	"github.com/MhmdEagel/lms-usti-be/controllers"
	"github.com/MhmdEagel/lms-usti-be/middleware"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/MhmdEagel/lms-usti-be/websocket"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
	Db := config.ConnectDatabase()
	config.SeedAdmin(Db)
	r := gin.Default()
	r.MaxMultipartMemory = 8 << 20
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))
	authMiddleware := middleware.NewAuthMiddleware()
	aclMiddleware := middleware.NewAclMiddleware()
	globalErrMiddleware := middleware.NewGlobalErrMiddleware()
	notFoundController := controllers.NewNotFoundController()
	r.NoRoute(notFoundController.NotFound)
	r.Use(globalErrMiddleware.Handle())
	api := r.Group("/lms-usti-api")
	{
		userRepository := repositories.NewUserRepository(Db)
		verificationRepository := repositories.NewVerificationRepository(Db)

		classroomRepository := repositories.NewClassroomRepository(Db)
		classroomForumPostRepository := repositories.NewClassroomForumPostRepository(Db)
		materialRepository := repositories.NewMaterialRepository(Db)
		assignmentRepository := repositories.NewAssignmentRepository(Db)
		meetingRepository := repositories.NewMeetingRepository(Db)
		submissionRepository := repositories.NewSubmissionRepository(Db)
		contentViewRepository := repositories.NewContentViewRepository(Db)

		mediaService := services.NewMediaService()

		authService := services.NewAuthService(userRepository, verificationRepository, mediaService)

		auditLogRepository := repositories.NewAuditLogRepository(Db)
		auditService := services.NewAuditService(auditLogRepository)

		adminService := services.NewAdminService(userRepository, verificationRepository, auditService)

		submissionService := services.NewSubmissionService(submissionRepository, assignmentRepository)

		assignmentService := services.NewAssignmentService(assignmentRepository, classroomRepository, submissionService, contentViewRepository)

		classroomPolicyRepository := repositories.NewClassroomPolicyRepository(Db)
		commentRepository := repositories.NewCommentRepository(Db)
		classroomService := services.NewClassroomService(classroomRepository, userRepository, submissionService, assignmentService, classroomPolicyRepository)

		forumRepository := repositories.NewForumRepository(Db)

		classroomForumPostService := services.NewClassroomForumPostService(classroomForumPostRepository, classroomRepository, commentRepository, classroomPolicyRepository)

		meetingService := services.NewMeetingService(meetingRepository, classroomRepository)
		materialService := services.NewMaterialService(materialRepository, classroomRepository, contentViewRepository)
		commentService := services.NewCommentService(commentRepository, classroomRepository, materialRepository, assignmentRepository, classroomForumPostRepository, forumRepository, classroomPolicyRepository)
		classroomPolicyService := services.NewClassroomPolicyService(classroomPolicyRepository)
		classroomPolicyController := controllers.NewClassroomPolicyController(classroomPolicyService)

		api.GET("", controllers.Test)
		auth := api.Group("/auth")
		{
			authController := controllers.NewAuthController(authService)

			auth.POST("/login", authController.Login)
			auth.POST("/reset-password", authController.SendResetPasswordEmail)
			auth.POST("/new-password", authController.ResetPassword)
			auth.Use(authMiddleware.Handle()).GET("/me", authController.Me)
			auth.Use(authMiddleware.Handle()).PUT("/me/profile", authController.UpdateProfile)
			auth.Use(authMiddleware.Handle()).POST("/me/send-otp", authController.SendOTP)
			auth.Use(authMiddleware.Handle()).POST("/me/verify-otp", authController.VerifyOTPAndChangePassword)
		}
		admin := api.Group("/admin/users")
		admin.Use(authMiddleware.Handle(), aclMiddleware.Handle([]string{"ADMIN"}))
		{
			adminController := controllers.NewAdminController(adminService)
			admin.GET("", adminController.FindAllUsers)
			admin.POST("/create", adminController.CreateUser)
			admin.GET("/:id", adminController.FindUserById)
			admin.PUT("/:id/update", adminController.UpdateUser)
			admin.DELETE("/:id", adminController.DeleteUser)
		}

		adminAudit := api.Group("/admin/audit-logs")
		adminAudit.Use(authMiddleware.Handle(), aclMiddleware.Handle([]string{"ADMIN"}))
		{
			auditController := controllers.NewAuditController(auditService)
			adminAudit.GET("", auditController.FindAllLogs)
		}

		commentController := controllers.NewCommentController(commentService)
		classroom := api.Group("/classroom")
		classroom.Use(authMiddleware.Handle())
		{

			classroomController := controllers.NewClassroomController(classroomService)
			classroomForumPostController := controllers.NewClassroomForumPostController(classroomForumPostService)
			meetingController := controllers.NewMeetingController(meetingService)
			materialController := controllers.NewMaterialController(materialService)
			assignmentController := controllers.NewAssignmentController(assignmentService)
			submissionController := controllers.NewSubmissionController(submissionService)

			classroom.GET("/dosen/dashboard-stats", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.GetDashboardStats)
			classroom.GET("/dosen/waiting-grade", aclMiddleware.Handle([]string{"DOSEN"}), assignmentController.FindWaitingGrade)
			classroom.GET("/dosen/classrooms", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.FindAllByDosenId)
			classroom.GET("/mahasiswa/dashboard-stats", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.GetMahasiswaDashboardStats)
			classroom.GET("/mahasiswa/classrooms", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.FindAllByMahasiswaId)
			classroom.POST("/create", aclMiddleware.Handle([]string{"DOSEN", "PRODI"}), classroomController.Create)
			classroom.POST("/join", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.Enroll)
			classroom.GET("/:id", classroomController.FindById)
			classroom.GET("/:id/members", classroomController.FindAllClassroomMember)
			classroom.GET("/:id/members/:memberId", classroomController.FindClassroomMemberById)
			classroom.DELETE("/:id/members/:memberId", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.RemoveMember)
			classroom.DELETE("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Delete)
			classroom.PATCH("/:id/archive", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Archive)
			classroom.PATCH("/:id/unarchive", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Unarchive)
			classroom.PUT("/:id", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.Update)
			classroom.GET("/:id/grades", aclMiddleware.Handle([]string{"DOSEN"}), classroomController.GetGrades)
			classroom.GET("/:id/my-grades", aclMiddleware.Handle([]string{"MAHASISWA"}), classroomController.GetMyGrades)

			classroom.GET("/:id/announcements", classroomForumPostController.FindAll)
			classroom.GET("/:id/announcements/:announcementId", classroomForumPostController.FindById)
			classroom.POST("/:id/announcements", aclMiddleware.Handle([]string{"DOSEN", "MAHASISWA"}), classroomForumPostController.Create)
			classroom.PUT("/:id/announcements/:announcementId", aclMiddleware.Handle([]string{"DOSEN"}), classroomForumPostController.Update)
			classroom.DELETE("/:id/announcements/:announcementId", aclMiddleware.Handle([]string{"DOSEN"}), classroomForumPostController.Delete)

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

			classroom.GET("/:id/assignments/:assignmentId/submissions", aclMiddleware.Handle([]string{"DOSEN"}), submissionController.FindAll)
			classroom.GET("/:id/assignments/:assignmentId/submissions/:submissionId", aclMiddleware.Handle([]string{"DOSEN"}), submissionController.FindById)
			classroom.GET("/:id/assignments/:assignmentId/my-submission", aclMiddleware.Handle([]string{"MAHASISWA"}), submissionController.FindMySubmission)
			classroom.POST("/:id/assignments/:assignmentId/submissions", aclMiddleware.Handle([]string{"MAHASISWA"}), submissionController.Submit)
			classroom.PUT("/:id/assignments/:assignmentId/submissions/:submissionId/grade", aclMiddleware.Handle([]string{"DOSEN"}), submissionController.Grade)

			classroom.GET("/:id/materials/:materialId/comments", commentController.FindAll)
			classroom.POST("/:id/materials/:materialId/comments", commentController.Create)
			classroom.DELETE("/:id/materials/:materialId/comments/:commentId", aclMiddleware.Handle([]string{"DOSEN", "MAHASISWA", "PRODI"}), commentController.Delete)

			classroom.GET("/:id/assignments/:assignmentId/comments", commentController.FindAll)
			classroom.POST("/:id/assignments/:assignmentId/comments", commentController.Create)
			classroom.DELETE("/:id/assignments/:assignmentId/comments/:commentId", aclMiddleware.Handle([]string{"DOSEN", "MAHASISWA", "PRODI"}), commentController.Delete)

			classroom.GET("/:id/announcements/:announcementId/comments", commentController.FindAll)
			classroom.POST("/:id/announcements/:announcementId/comments", commentController.Create)
			classroom.DELETE("/:id/announcements/:announcementId/comments/:commentId", aclMiddleware.Handle([]string{"DOSEN", "MAHASISWA", "PRODI"}), commentController.Delete)
			classroom.GET("/:id/meetings", meetingController.FindAll)
			classroom.POST("/:id/meetings", aclMiddleware.Handle([]string{"DOSEN"}), meetingController.Create)
			classroom.PUT("/:id/meetings/reorder", aclMiddleware.Handle([]string{"DOSEN"}), meetingController.Reorder)
			classroom.GET("/:id/meetings/:meetingId", meetingController.FindById)
			classroom.PUT("/:id/meetings/:meetingId", aclMiddleware.Handle([]string{"DOSEN"}), meetingController.Update)
			classroom.DELETE("/:id/meetings/:meetingId", aclMiddleware.Handle([]string{"DOSEN"}), meetingController.Delete)

			classroom.GET("/:id/policies", classroomPolicyController.FindByClassroomId)
			classroom.PUT("/:id/policies", aclMiddleware.Handle([]string{"DOSEN"}), classroomPolicyController.Update)
		}
		forumService := services.NewForumService(forumRepository, commentRepository)
		forumController := controllers.NewForumController(forumService)

		forum := api.Group("/forum")
		forum.Use(authMiddleware.Handle())
		{
			forum.GET("/posts", forumController.FindAllPosts)
			forum.POST("/posts", aclMiddleware.Handle([]string{"DOSEN", "PRODI"}), forumController.CreatePost)
			forum.GET("/posts/:postId", forumController.FindPostById)
			forum.DELETE("/posts/:postId", aclMiddleware.Handle([]string{"DOSEN", "MAHASISWA", "PRODI"}), forumController.DeletePost)

			forum.GET("/posts/:postId/comments", commentController.FindAll)
			forum.POST("/posts/:postId/comments", commentController.Create)
			forum.DELETE("/posts/:postId/comments/:commentId", aclMiddleware.Handle([]string{"DOSEN", "MAHASISWA", "PRODI"}), commentController.Delete)
		}

		conversationRepository := repositories.NewConversationRepository(Db)
		messageRepository := repositories.NewMessageRepository(Db)
		chatService := services.NewChatService(conversationRepository, messageRepository, userRepository)

		hub := websocket.NewHub(chatService)
		go hub.Run()

		wsHandler := websocket.NewWebSocketHandler(hub)
		api.GET("/ws/chat", wsHandler.HandleUpgrade)

		chatController := controllers.NewChatController(chatService, hub)

		chat := api.Group("/chat")
		chat.Use(authMiddleware.Handle())
		{
			chat.GET("/conversations", chatController.GetConversations)
			chat.POST("/conversations", chatController.CreateConversation)
			chat.GET("/conversations/:id/messages", chatController.GetMessages)
			chat.POST("/conversations/:id/messages", chatController.SendMessage)
			chat.POST("/conversations/:id/read", chatController.MarkConversationAsRead)
			chat.GET("/users", chatController.SearchUsers)
		}

		media := api.Group("/media")
		{
			mediaController := controllers.NewMediaController(mediaService)
			materials := media.Group("/materials")
			{
				materials.GET("/:name", mediaController.FindMaterialFile)
				materials.POST("", authMiddleware.Handle(), aclMiddleware.Handle([]string{"DOSEN"}), mediaController.UploadMaterial)
				materials.POST("/delete-batch", authMiddleware.Handle(), mediaController.RemoveMaterialBatch)
				materials.DELETE("/:name", authMiddleware.Handle(), mediaController.RemoveMaterial)
			}
			assignments := media.Group("/assignments")
			{
				assignments.GET("/:name", mediaController.FindAssignmentFile)
				assignments.POST("", authMiddleware.Handle(), aclMiddleware.Handle([]string{"DOSEN"}), mediaController.UploadAssignment)
				assignments.POST("/delete-batch", authMiddleware.Handle(), mediaController.RemoveAssignmentBatch)
				assignments.DELETE("/:name", authMiddleware.Handle(), mediaController.RemoveAssignment)
			}
			profiles := media.Group("/profiles")
			{
				profiles.POST("", mediaController.UploadProfilePicture)
				profiles.GET("/:name", mediaController.FindProfilePicture)
				profiles.DELETE("/:name", mediaController.RemoveProfilePicture)
			}
			submissions := media.Group("/submissions")
			{
				submissions.GET("/:name", mediaController.FindSubmissionFile)
				submissions.POST("", authMiddleware.Handle(), aclMiddleware.Handle([]string{"MAHASISWA"}), mediaController.UploadSubmission)
				submissions.POST("/delete-batch", authMiddleware.Handle(), mediaController.RemoveSubmissionBatch)
				submissions.DELETE("/:name", authMiddleware.Handle(), mediaController.RemoveSubmission)
			}
		}
	}
	return r
}
