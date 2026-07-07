package data

import (
	"time"

	"github.com/MhmdEagel/lms-usti-be/model"
)

type CreateClassroomRequest struct {
	ClassName   string    `json:"class_name" binding:"required,min=8"`
	ClassCover  string    `json:"class_cover" binding:"required"`
	Term        int       `json:"term" binding:"required"`
	RoomNumber  int       `json:"room_number" binding:"required"`
	Day         int       `json:"day" binding:"required"`
	ClassStart  time.Time `json:"class_start" binding:"required"`
	ClassEnd    time.Time `json:"class_end" binding:"required"`
	Prodi       string    `json:"prodi" binding:"required"`
	TahunAjaran string    `json:"tahun_ajaran" binding:"required"`
	DosenId     string
}
type UpdateClassroomRequest struct {
	Id          string
	ClassName   *string    `json:"class_name"`
	ClassCover  *string    `json:"class_cover"`
	Term        *int       `json:"term"`
	RoomNumber  *int       `json:"room_number"`
	Day         *int       `json:"day"`
	ClassStart  *time.Time `json:"class_start"`
	ClassEnd    *time.Time `json:"class_end"`
	Prodi       *string    `json:"prodi"`
	TahunAjaran *string    `json:"tahun_ajaran"`
}

type ClassroomFilter struct {
	Search      string
	Prodi       string
	Term        string
	TahunAjaran string
	RoomNumber  string
}

type JoinClassroomRequest struct {
	ClassCode string `json:"class_code" binding:"required"`
}

type AnnouncementRequest struct {
	Title       string `json:"title" binding:"required"`
	Content     string `json:"content" binding:"required"`
	ClassroomId string
	DosenId     string
}
type AnnouncementUpdateRequest struct {
	IsPinned *bool   `json:"is_pinned"`
	Title    *string `json:"title"`
	Content  *string `json:"content"`
}
type AnnouncementResponse struct {
	Id            string `json:"id"`
	Title         string `json:"title"`
	Content       string `json:"content"`
	IsPinned      bool   `json:"is_pinned"`
	ClassroomName string `json:"classroom_name"`
	CreatedBy     string `json:"created_by"`
	CreatedAt     string `json:"created_at"`
	CommentCount  int    `json:"comment_count"`
}

type ClassroomResponse struct {
	ID          string     `json:"id"`
	ClassCover  string     `json:"class_cover"`
	ClassCode   string     `json:"class_code"`
	ClassName   string     `json:"class_name"`
	Term        int        `json:"term"`
	RoomNumber  int        `json:"room_number"`
	Day         int        `json:"day"`
	ClassStart  time.Time  `json:"class_start"`
	ClassEnd    time.Time  `json:"class_end"`
	Prodi       string     `json:"prodi"`
	TahunAjaran string     `json:"tahun_ajaran"`
	Dosen       model.User `json:"dosen"`
}

type ClassroomDetailResponse struct {
	ID          string     `json:"id"`
	ClassCover  string     `json:"class_cover"`
	ClassCode   string     `json:"class_code"`
	ClassName   string     `json:"class_name"`
	Term        int        `json:"term"`
	RoomNumber  int        `json:"room_number"`
	Day         int        `json:"day"`
	ClassStart  time.Time  `json:"class_start"`
	ClassEnd    time.Time  `json:"class_end"`
	Prodi       string     `json:"prodi"`
	TahunAjaran string     `json:"tahun_ajaran"`
	Dosen       model.User `json:"dosen"`
}

type DashboardStatsResponse struct {
	TotalClassrooms  int64 `json:"total_classrooms"`
	TotalStudents    int64 `json:"total_students"`
	TotalAssignments int64 `json:"total_assignments"`
}

type ClassroomMembersReponse struct {
	Dosen     model.User   `json:"dosen"`
	Mahasiswa []model.User `json:"mahasiswa"`
}

type ClassroomMemberDetailResponse struct {
	ClassName string `json:"class_name"`
	Member    model.User `json:"member"`
}

type MahasiswaAssignmentItem struct {
	AssignmentID    string  `json:"assignment_id"`
	AssignmentTitle string  `json:"assignment_title"`
	ClassroomID     string  `json:"classroom_id"`
	ClassroomName   string  `json:"classroom_name"`
	Deadline        *string `json:"deadline"`
	DaysRemaining   *int    `json:"days_remaining"`
}

type MahasiswaDashboardStatsResponse struct {
	UpcomingAssignments []MahasiswaAssignmentItem `json:"upcoming_assignments"`
}
