package main

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/MhmdEagel/lms-usti-be/config"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

var (
	dosenName     = "James Bond M. Kom"
	dosenEmail    = "dosenusti@yopmail.com"
	dosenPassword = "dosenusti123"
	dosenNidn     = "0012345678"

	mahasiswas = []struct {
		Name  string
		Email string
		Nim   string
	}{
		{Name: "Arthur Morgan", Email: "mahasiswausti@yopmail.com", Nim: "202401001"},
		{Name: "John Marston", Email: "john.marston@lms-usti.ac.id", Nim: "202401002"},
		{Name: "Abigail Roberts", Email: "abigail.roberts@lms-usti.ac.id", Nim: "202401003"},
		{Name: "Charles Smith", Email: "charles.smith@lms-usti.ac.id", Nim: "202401004"},
	}

	mahasiswaPassword = "mahasiswausti123"

	className        = "Interaksi Manusia dan Komputer"
	classProdi       = "Teknik Informatika"
	classTahunAjaran = "2026/2027"

	meetings = []struct {
		Topic       string
		Description string
		Position    int
	}{
		{
			Topic:       "Pendahuluan Interaksi Manusia dan Komputer",
			Description: "Pengertian IMK, sejarah perkembangan, dan ruang lingkup.",
			Position:    1,
		},
		{
			Topic:       "Prinsip Desain Antarmuka",
			Description: "Prinsip-prinsip desain yang berpusat pada pengguna (User-Centered Design).",
			Position:    2,
		},
		{
			Topic:       "Metode Evaluasi Usability",
			Description: "Berbagai metode evaluasi usability termasuk System Usability Scale (SUS).",
			Position:    3,
		},
	}

	assignments = []struct {
		Title       string
		Instruction string
		MeetingIdx  int
		Deadline    int
		LateSub     string
	}{
		{
			Title:       "Tugas 1: Analisis Antarmuka Aplikasi",
			Instruction: "Pilih salah satu aplikasi yang sering Anda gunakan. Analisis antarmuka berdasarkan 8 aturan emas Shneiderman. Berikan screenshot dan penjelasan untuk setiap aturan.",
			MeetingIdx:  0,
			Deadline:    7,
			LateSub:     "not_allowed",
		},
		{
			Title:       "Tugas 2: Prototype Desain UI",
			Instruction: "Buat prototype low-fidelity untuk aplikasi pemesanan makanan online. Gunakan Figma atau alat desain lainnya. Kumpulkan dalam format PDF.",
			MeetingIdx:  0,
			Deadline:    14,
			LateSub:     "allow",
		},
		{
			Title:       "Tugas 3: Evaluasi Heuristik",
			Instruction: "Lakukan evaluasi heuristik pada website e-commerce pilihan Anda. Gunakan 10 heuristik Nielsen. Dokumentasikan temuan Anda dalam bentuk laporan.",
			MeetingIdx:  1,
			Deadline:    21,
			LateSub:     "allow",
		},
	}
)

func main() {
	Db := config.ConnectDatabase()

	cleanupDatabase(Db)
	dosen := seedDosen(Db)
	students := seedMahasiswas(Db)
	classroom := seedClassroom(Db, dosen)
	enrollMahasiswas(Db, classroom, students)
	forumPosts := seedPublicForums(Db, dosen, students)
	seedPublicForumComments(Db, forumPosts, dosen, students)
	classroomForumPosts := seedClassroomForums(Db, classroom, dosen)
	seedClassroomForumComments(Db, classroomForumPosts, dosen, students)
	meetingRecords := seedMeetings(Db, classroom, dosen)
	assignmentRecords := seedAssignments(Db, classroom, dosen, meetingRecords)
	seedSubmissions(Db, assignmentRecords, students)

	fmt.Println("\n✅ DATA SEEDED SUCCESSFULLY!")
	fmt.Printf("   Dosen:     %s (%s)\n", dosenName, dosenEmail)
	fmt.Printf("   Password Dosen: %s\n", dosenPassword)
	fmt.Printf("   Password Mahasiswa: %s\n", mahasiswaPassword)
	fmt.Printf("   Classroom: %s\n", className)
	fmt.Printf("   Students:  %d\n", len(students))
	fmt.Printf("   Meetings:  %d\n", len(meetingRecords))
	fmt.Printf("   Assignments: %d\n", len(assignmentRecords))
	fmt.Printf("   Public Forum Posts: 2\n")
	fmt.Printf("   Forum Comments: 4\n")
	fmt.Printf("   Classroom Forum Comments: 5\n")
	fmt.Printf("   Classroom Forum Posts: 3\n")
	fmt.Printf("\n   Login di http://localhost:3000/auth/login\n")
}

func cleanupDatabase(db *gorm.DB) {
	db.Exec("SET FOREIGN_KEY_CHECKS = 0")
	tables := []string{
		"message_read_by",
		"messages",
		"conversation_participants",
		"conversations",
		"content_views",
		"comments",
		"classroom_forum_posts",
		"forum_posts",
		"submission_attachments",
		"submissions",
		"assignment_attachments",
		"assignments",
		"material_attachments",
		"materials",
		"meetings",
		"classroom_mahasiswas",
		"classroom_policies",
		"classrooms",
		"audit_logs",
		"verification_tokens",
		"users",
	}
	for _, t := range tables {
		db.Exec("TRUNCATE TABLE " + t)
	}
	db.Exec("SET FOREIGN_KEY_CHECKS = 1")
	fmt.Println("🧹 Database dibersihkan")
}

func seedDosen(db *gorm.DB) model.User {
	hash, err := lib.HashPassword(dosenPassword)
	if err != nil {
		log.Fatalf("Gagal hash password: %v", err)
	}

	dosen := model.User{
		Fullname: dosenName,
		Email:    dosenEmail,
		Password: hash,
		Role:     "DOSEN",
		Nidn:     dosenNidn,
	}
	if err := db.Create(&dosen).Error; err != nil {
		log.Fatalf("Gagal seed dosen: %v", err)
	}
	fmt.Printf("👨‍🏫 Dosen: %s\n", dosen.Fullname)
	return dosen
}

func seedMahasiswas(db *gorm.DB) []model.User {
	students := make([]model.User, 0, len(mahasiswas))
	for _, m := range mahasiswas {
		hash, err := lib.HashPassword(mahasiswaPassword)
		if err != nil {
			log.Fatalf("Gagal hash password: %v", err)
		}
		student := model.User{
			Fullname: m.Name,
			Email:    m.Email,
			Password: hash,
			Role:     "MAHASISWA",
			Nim:      m.Nim,
		}
		if err := db.Create(&student).Error; err != nil {
			log.Fatalf("Gagal seed mahasiswa %s: %v", m.Name, err)
		}
		students = append(students, student)
		fmt.Printf("🧑‍🎓 %s (%s)\n", student.Fullname, student.Email)
	}
	return students
}

func seedClassroom(db *gorm.DB, dosen model.User) model.Classroom {
	classStart := time.Date(2026, 8, 1, 8, 0, 0, 0, time.UTC)
	classEnd := time.Date(2026, 12, 31, 10, 0, 0, 0, time.UTC)

	classroom := model.Classroom{
		ClassCover:  "basic",
		ClassName:   className,
		Term:        1,
		RoomNumber:  301,
		Day:         6,
		ClassStart:  classStart,
		ClassEnd:    classEnd,
		DosenId:     dosen.ID,
		Prodi:       classProdi,
		TahunAjaran: classTahunAjaran,
	}
	if err := db.Create(&classroom).Error; err != nil {
		log.Fatalf("Gagal seed classroom: %v", err)
	}
	fmt.Printf("📚 Kelas: %s (%s)\n", classroom.ClassName, classroom.ClassCode)
	return classroom
}

func enrollMahasiswas(db *gorm.DB, classroom model.Classroom, students []model.User) {
	for _, s := range students {
		cm := model.ClassroomMahasiswa{
			UserId:      s.ID,
			ClassroomId: classroom.ID,
		}
		if err := db.Create(&cm).Error; err != nil {
			log.Fatalf("Gagal enroll %s: %v", s.Fullname, err)
		}
	}
	fmt.Printf("✅ Enrolled %d mahasiswa\n", len(students))
}

func seedMeetings(db *gorm.DB, classroom model.Classroom, dosen model.User) []model.Meeting {
	records := make([]model.Meeting, 0, len(meetings))
	for _, m := range meetings {
		meeting := model.Meeting{
			Position:    m.Position,
			Topic:       m.Topic,
			Description: m.Description,
			ClassroomId: classroom.ID,
			DosenId:     dosen.ID,
		}
		if err := db.Create(&meeting).Error; err != nil {
			log.Fatalf("Gagal seed meeting: %v", err)
		}
		records = append(records, meeting)
	}
	fmt.Printf("📖 %d pertemuan\n", len(records))
	return records
}

func seedAssignments(db *gorm.DB, classroom model.Classroom, dosen model.User, meetings []model.Meeting) []model.Assignment {
	records := make([]model.Assignment, 0, len(assignments))
	for _, a := range assignments {
		var deadline sql.NullTime
		if a.Deadline > 0 {
			t := time.Now().AddDate(0, 0, a.Deadline)
			deadline = sql.NullTime{Time: t, Valid: true}
		}

		assignment := model.Assignment{
			Title:          a.Title,
			Deadline:       deadline,
			Instruction:    a.Instruction,
			LateSubmission: a.LateSub,
			DosenId:        dosen.ID,
			ClassroomId:    classroom.ID,
			MeetingId:      &meetings[a.MeetingIdx].ID,
		}
		if err := db.Create(&assignment).Error; err != nil {
			log.Fatalf("Gagal seed assignment: %v", err)
		}
		records = append(records, assignment)
	}
	fmt.Printf("📝 %d tugas\n", len(records))
	return records
}

func seedSubmissions(db *gorm.DB, assignments []model.Assignment, students []model.User) {
	count := 0
	for _, a := range assignments {
		for _, s := range students {
			statuses := []string{"submitted", "submitted", "graded"}
			status := statuses[rand.Intn(len(statuses))]
			submissionDate := time.Now().Add(-time.Duration(rand.Intn(72)) * time.Hour)
			ns := sql.NullTime{Time: submissionDate, Valid: true}

			sub := model.Submission{
				Status:         status,
				SubmissionDate: ns,
				StudentId:      s.ID,
				AssignmentId:   a.ID,
			}

			if status == "graded" {
				score := float64(rand.Intn(21) + 75)
				sub.Score = &score
			}

			if err := db.Create(&sub).Error; err != nil {
				log.Fatalf("Gagal seed submission: %v", err)
			}
			count++
		}
	}
	fmt.Printf("📬 %d submission\n", count)
}

func seedPublicForums(db *gorm.DB, dosen model.User, students []model.User) []model.ForumPost {
	posts := []model.ForumPost{
		{
			Title:     "Tips Belajar Efektif Menggunakan LMS",
			Content:   "Berikut beberapa tips: (1) Cek tugas setiap hari, (2) Manfaatkan fitur forum untuk diskusi, (3) Kumpulkan tugas sebelum deadline.",
			CreatedBy: dosen.ID,
		},
		{
			Title:     "Selamat Datang di LMS USTI - Semester Baru!",
			Content:   "Selamat datang mahasiswa baru. LMS USTI siap mendukung perkuliahan semester ini. Silakan eksplor fitur-fitur yang tersedia.",
			CreatedBy: dosen.ID,
		},
	}

	created := make([]model.ForumPost, 0, len(posts))
	for _, p := range posts {
		if err := db.Create(&p).Error; err != nil {
			log.Fatalf("Gagal seed forum post: %v", err)
		}
		created = append(created, p)
	}
	fmt.Printf("💬 %d forum publik\n", len(created))
	return created
}

func seedPublicForumComments(db *gorm.DB, posts []model.ForumPost, dosen model.User, students []model.User) {
	comments := []model.Comment{
		{
			Content:         "Terima kasih tipsnya Pak. Akan saya coba praktikkan.",
			CommentableType: "forum_post",
			CommentableID:   posts[0].ID,
			CreatedBy:       students[0].ID,
		},
		{
			Content:         "Sama-sama Arthur. Semoga membantu perkuliahan Anda.",
			CommentableType: "forum_post",
			CommentableID:   posts[0].ID,
			CreatedBy:       dosen.ID,
		},
		{
			Content:         "Selamat datang di semester baru! Semangat kuliahnya.",
			CommentableType: "forum_post",
			CommentableID:   posts[1].ID,
			CreatedBy:       students[0].ID,
		},
		{
			Content:         "Terima kasih! Siap mengikuti perkuliahan semester ini.",
			CommentableType: "forum_post",
			CommentableID:   posts[1].ID,
			CreatedBy:       dosen.ID,
		},
	}

	for _, c := range comments {
		if err := db.Create(&c).Error; err != nil {
			log.Fatalf("Gagal seed comment: %v", err)
		}
	}
	fmt.Printf("💬 %d komentar forum publik\n", len(comments))
}

func seedClassroomForums(db *gorm.DB, classroom model.Classroom, dosen model.User) []model.ClassroomForumPost {
	posts := []model.ClassroomForumPost{
		{
			Title:       "Pengumuman: Perubahan Jadwal Kelas",
			Content:     "Diberitahukan kepada seluruh mahasiswa bahwa pertemuan minggu depan akan diadakan secara daring via Zoom. Link akan menyusul.",
			ClassroomId: classroom.ID,
			DosenId:     dosen.ID,
			IsPinned:    true,
		},
		{
			Title:       "Diskusi: Proyek Ujian Tengah Semester",
			Content:     "Silakan diskusikan ide proyek UTS di sini. Setiap kelompok wajib mengumpulkan proposal paling lambat pertemuan ke-4.",
			ClassroomId: classroom.ID,
			DosenId:     dosen.ID,
		},
		{
			Title:       "Materi Tambahan - Jurnal Referensi",
			Content:     "Berikut jurnal yang relevan dengan materi interaksi manusia dan komputer. Silakan dibaca sebelum pertemuan berikutnya.",
			ClassroomId: classroom.ID,
			DosenId:     dosen.ID,
		},
	}

	created := make([]model.ClassroomForumPost, 0, len(posts))
	for _, p := range posts {
		if err := db.Create(&p).Error; err != nil {
			log.Fatalf("Gagal seed classroom forum post: %v", err)
		}
		created = append(created, p)
	}
	fmt.Printf("🏫 %d forum kelas\n", len(created))
	return created
}

func seedClassroomForumComments(db *gorm.DB, posts []model.ClassroomForumPost, dosen model.User, students []model.User) {
	otherStudents := students[1:]
	if len(otherStudents) == 0 {
		return
	}

	comments := []model.Comment{
		{
			Content:         "Terima kasih informasinya Pak. Apakah Zoom-nya pakai akun institusi?",
			CommentableType: "forum_post",
			CommentableID:   posts[0].ID,
			CreatedBy:       otherStudents[0].ID,
		},
		{
			Content:         "Siap, link ditunggu Pak.",
			CommentableType: "forum_post",
			CommentableID:   posts[0].ID,
			CreatedBy:       otherStudents[1%len(otherStudents)].ID,
		},
		{
			Content:         "Saya tertarik bikin aplikasi monitoring tugas kelompok. Ada yang mau gabung?",
			CommentableType: "forum_post",
			CommentableID:   posts[1].ID,
			CreatedBy:       otherStudents[2%len(otherStudents)].ID,
		},
		{
			Content:         "Saya mau gabung! Ide bagus itu.",
			CommentableType: "forum_post",
			CommentableID:   posts[1].ID,
			CreatedBy:       otherStudents[0].ID,
		},
		{
			Content:         "Jurnalnya sangat membantu. Terima kasih Pak.",
			CommentableType: "forum_post",
			CommentableID:   posts[2].ID,
			CreatedBy:       otherStudents[1%len(otherStudents)].ID,
		},
	}

	for _, c := range comments {
		if err := db.Create(&c).Error; err != nil {
			log.Fatalf("Gagal seed classroom forum comment: %v", err)
		}
	}
	fmt.Printf("💬 %d komentar forum kelas\n", len(comments))
}
