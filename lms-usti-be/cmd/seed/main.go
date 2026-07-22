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

	classroomsSeed = []struct {
		Name      string
		Day       int
		StartHour int
		StartMin  int
		EndHour   int
		EndMin    int
		Room      int
	}{
		{Name: "Pemrograman Web",             Day: 1, StartHour: 8,  StartMin: 0,  EndHour: 10, EndMin: 0,  Room: 101},
		{Name: "Pemrograman Mobile",          Day: 1, StartHour: 10, StartMin: 0,  EndHour: 12, EndMin: 0,  Room: 102},
		{Name: "Basis Data",                  Day: 2, StartHour: 8,  StartMin: 0,  EndHour: 10, EndMin: 0,  Room: 103},
		{Name: "Jaringan Komputer",           Day: 2, StartHour: 10, StartMin: 0,  EndHour: 12, EndMin: 0,  Room: 104},
		{Name: "Kecerdasan Buatan",           Day: 3, StartHour: 8,  StartMin: 0,  EndHour: 10, EndMin: 0,  Room: 105},
		{Name: "Sistem Operasi",              Day: 3, StartHour: 10, StartMin: 0,  EndHour: 12, EndMin: 0,  Room: 106},
		{Name: "Rekayasa Perangkat Lunak",    Day: 4, StartHour: 8,  StartMin: 0,  EndHour: 10, EndMin: 0,  Room: 107},
		{Name: "Keamanan Siber",              Day: 4, StartHour: 10, StartMin: 0,  EndHour: 12, EndMin: 0,  Room: 108},
		{Name: "Struktur Data & Algoritma",   Day: 5, StartHour: 8,  StartMin: 0,  EndHour: 10, EndMin: 0,  Room: 109},
		{Name: "Pemrograman Berorientasi Objek", Day: 5, StartHour: 10, StartMin: 0,  EndHour: 12, EndMin: 0,  Room: 110},
	}

	classProdi       = "Teknik Informatika"
	classTahunAjaran = "2026/2027"

	meetings = []struct {
		Topic       string
		Description string
		Position    int
	}{
		{
			Topic:       "Pendahuluan Pemrograman Web",
			Description: "Pengertian web, arsitektur client-server, pengenalan HTML, CSS, dan JavaScript.",
			Position:    1,
		},
		{
			Topic:       "HTML Dasar dan Semantic Elements",
			Description: "Struktur dokumen HTML, tag semantic, form, dan multimedia.",
			Position:    2,
		},
		{
			Topic:       "CSS Layouting: Flexbox dan Grid",
			Description: "Teknik layout menggunakan Flexbox dan CSS Grid untuk desain responsif.",
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
			Title:       "Tugas 1: Halaman Profil Pribadi",
			Instruction: "Buat halaman HTML profil pribadi yang terdiri dari: foto, biodata, riwayat pendidikan, dan skill. Gunakan semantic HTML5.",
			MeetingIdx:  0,
			Deadline:    7,
			LateSub:     "not_allowed",
		},
		{
			Title:       "Tugas 2: Form Registrasi dengan Validasi",
			Instruction: "Buat form registrasi yang lengkap dengan berbagai jenis input dan validasi menggunakan HTML5. Sertakan input: nama, email, password, tanggal lahir, dan upload foto.",
			MeetingIdx:  1,
			Deadline:    14,
			LateSub:     "allow",
		},
		{
			Title:       "Tugas 3: Landing Page Responsif",
			Instruction: "Buat landing page menggunakan Flexbox dan CSS Grid. Halaman harus responsif di mobile, tablet, dan desktop.",
			MeetingIdx:  2,
			Deadline:    21,
			LateSub:     "allow",
		},
	}

	materials = []struct {
		Title       string
		Description string
		MeetingIdx  int
	}{
		{
			Title:       "Materi HTML Dasar",
			Description: "Dokumentasi lengkap tag-tag HTML5 beserta contoh penggunaannya.",
			MeetingIdx:  0,
		},
		{
			Title:       "Slide CSS Flexbox",
			Description: "Slide presentasi tentang CSS Flexbox lengkap dengan diagram dan contoh kode.",
			MeetingIdx:  1,
		},
		{
			Title:       "Video Tutorial CSS Grid",
			Description: "Video tutorial implementasi CSS Grid untuk layout halaman web modern.",
			MeetingIdx:  2,
		},
	}

	materialAttachments = []struct {
		Name       string
		Type       model.AttachmentType
		Url        string
		UniqueName string
		MaterialIdx int
	}{
		{
			Name:        "dummy_pdf.pdf",
			Type:        model.AttachmentTypeFile,
			Url:         "/lms-usti-api/media/materials/dummy_pdf.pdf",
			UniqueName:  "dummy_pdf.pdf",
			MaterialIdx: 0,
		},
		{
			Name:        "dummy_video.mp4",
			Type:        model.AttachmentTypeFile,
			Url:         "/lms-usti-api/media/materials/dummy_video.mp4",
			UniqueName:  "dummy_video.mp4",
			MaterialIdx: 0,
		},
		{
			Name:        "dummy_pdf.pdf",
			Type:        model.AttachmentTypeFile,
			Url:         "/lms-usti-api/media/materials/dummy_pdf.pdf",
			UniqueName:  "dummy_pdf.pdf",
			MaterialIdx: 1,
		},
		{
			Name:        "dummy_video.mp4",
			Type:        model.AttachmentTypeFile,
			Url:         "/lms-usti-api/media/materials/dummy_video.mp4",
			UniqueName:  "dummy_video.mp4",
			MaterialIdx: 1,
		},
		{
			Name:        "dummy_pdf.pdf",
			Type:        model.AttachmentTypeFile,
			Url:         "/lms-usti-api/media/materials/dummy_pdf.pdf",
			UniqueName:  "dummy_pdf.pdf",
			MaterialIdx: 2,
		},
		{
			Name:        "dummy_video.mp4",
			Type:        model.AttachmentTypeFile,
			Url:         "/lms-usti-api/media/materials/dummy_video.mp4",
			UniqueName:  "dummy_video.mp4",
			MaterialIdx: 2,
		},
	}
)

func main() {
	Db := config.ConnectDatabase()

	cleanupDatabase(Db)
	dosen := seedDosen(Db)
	students := seedMahasiswas(Db)
	classrooms := seedClassrooms(Db, dosen)
	forumPosts := seedPublicForums(Db, dosen, students)
	seedPublicForumComments(Db, forumPosts, dosen, students)

	var totalMeetings, totalMaterials, totalAssignments int
	for _, cls := range classrooms {
		enrollMahasiswas(Db, cls, students)
		classroomForumPosts := seedClassroomForums(Db, cls, dosen)
		seedClassroomForumComments(Db, classroomForumPosts, dosen, students)
		meetingRecords := seedMeetings(Db, cls, dosen)
		materialRecords := seedMaterials(Db, cls, dosen, meetingRecords)
		assignmentRecords := seedAssignments(Db, cls, dosen, meetingRecords)
		seedSubmissions(Db, assignmentRecords, students)
		totalMeetings += len(meetingRecords)
		totalMaterials += len(materialRecords)
		totalAssignments += len(assignmentRecords)
	}

	fmt.Println("\n✅ DATA SEEDED SUCCESSFULLY!")
	fmt.Printf("   Dosen:     %s (%s)\n", dosenName, dosenEmail)
	fmt.Printf("   Password Dosen: %s\n", dosenPassword)
	fmt.Printf("   Password Mahasiswa: %s\n", mahasiswaPassword)
	fmt.Printf("   Classrooms: %d\n", len(classrooms))
	fmt.Printf("   Students:  %d\n", len(students))
	fmt.Printf("   Meetings:  %d\n", totalMeetings)
	fmt.Printf("   Materials:  %d\n", totalMaterials)
	fmt.Printf("   Assignments: %d\n", totalAssignments)
	fmt.Printf("   Public Forum Posts: 2\n")
	fmt.Printf("   Forum Comments: 4\n")
	fmt.Printf("   Classroom Forum Comments: %d\n", len(classrooms)*5)
	fmt.Printf("   Classroom Forum Posts: %d\n", len(classrooms)*3)
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

func seedClassrooms(db *gorm.DB, dosen model.User) []model.Classroom {
	baseDate := time.Date(2026, 8, 1, 0, 0, 0, 0, time.UTC)
	records := make([]model.Classroom, 0, len(classroomsSeed))

	for _, cs := range classroomsSeed {
		start := time.Date(baseDate.Year(), baseDate.Month(), baseDate.Day(), cs.StartHour, cs.StartMin, 0, 0, time.UTC)
		end := time.Date(baseDate.Year(), baseDate.Month(), baseDate.Day(), cs.EndHour, cs.EndMin, 0, 0, time.UTC)

		classroom := model.Classroom{
			ClassCover:  "basic",
			ClassName:   cs.Name,
			Term:        1,
			RoomNumber:  cs.Room,
			Day:         cs.Day,
			ClassStart:  start,
			ClassEnd:    end,
			DosenId:     dosen.ID,
			Prodi:       classProdi,
			TahunAjaran: classTahunAjaran,
		}
		if err := db.Create(&classroom).Error; err != nil {
			log.Fatalf("Gagal seed classroom %s: %v", cs.Name, err)
		}
		records = append(records, classroom)
		fmt.Printf("📚 Kelas: %s — Day %d %02d:%02d-%02d:%02d (%s)\n",
			classroom.ClassName, cs.Day, cs.StartHour, cs.StartMin, cs.EndHour, cs.EndMin, classroom.ClassCode)
	}
	return records
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
			Title:       "Materi Tambahan - Referensi CSS",
			Content:     "Berikut tautan referensi CSS yang dapat membantu memahami layouting: CSS Tricks, MDN Web Docs, dan Flexbox Froggy untuk latihan interaktif.",
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

func seedMaterials(db *gorm.DB, classroom model.Classroom, dosen model.User, meetings []model.Meeting) []model.Material {
	created := make([]model.Material, 0, len(materials))
	for _, m := range materials {
		material := model.Material{
			Title:       m.Title,
			Description: m.Description,
			DosenId:     dosen.ID,
			ClassroomId: classroom.ID,
			MeetingId:   &meetings[m.MeetingIdx].ID,
		}
		if err := db.Create(&material).Error; err != nil {
			log.Fatalf("Gagal seed material: %v", err)
		}
		created = append(created, material)
	}
	fmt.Printf("📄 %d materi\n", len(created))

	for _, ma := range materialAttachments {
		attachment := model.MaterialAttachment{
			Name:       ma.Name,
			Type:       ma.Type,
			Url:        ma.Url,
			UniqueName: ma.UniqueName,
			MaterialId: created[ma.MaterialIdx].ID,
		}
		if err := db.Create(&attachment).Error; err != nil {
			log.Fatalf("Gagal seed material attachment: %v", err)
		}
	}
	fmt.Printf("📎 %d lampiran materi\n", len(materialAttachments))

	return created
}
