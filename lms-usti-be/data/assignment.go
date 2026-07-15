package data

import "time"

type AssignmentRequest struct {
	Title       string              `json:"title" binding:"required"`
	Deadline    *time.Time          `json:"deadline"`
	Instruction string              `json:"instruction"`
	MeetingId   *string             `json:"meeting_id"`
	Attachments []AttachmentRequest `json:"attachments"`
	ClassroomId string
	DosenId     string
}
type AssignmentUpdateRequest struct {
	ID          string
	Title       *string             `json:"title"`
	Deadline    *time.Time          `json:"deadline"`
	Instruction *string             `json:"instruction"`
	MeetingId   *string             `json:"meeting_id"`
	Attachments []AttachmentRequest `json:"attachments"`
	ClassroomId string
}
type AssignmentDetailResponse struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	ClassroomName string    `json:"classroom_name"`
	Deadline      *time.Time `json:"deadline"`
	Instruction   string    `json:"instruction"`
	MeetingId     *string   `json:"meeting_id"`
	Stats         *SubmissionStatsResponse `json:"stats"`
	Attachments   []AttachmentResponse       `json:"attachments"`
}
type AssignmentResponse struct {
	ID                 string                   `json:"id"`
	Title              string                   `json:"title"`
	Deadline           *time.Time               `json:"deadline"`
	Instruction        string                   `json:"instruction"`
	Stats              *SubmissionStatsResponse `json:"stats"`
	MySubmissionStatus string                   `json:"my_submission_status"`
	MyScore            *float64                 `json:"my_score"`
	MySubmissionDate   *time.Time               `json:"my_submission_date"`
}

type AssignmentRubricRequest struct {
	Id    *uint   `json:"id"`
	Name  string  `json:"name" binding:"required"`
	Score float64 `json:"score" binding:"required"`
}
type AssignmentWaitingGradeResponse struct {
	SubmissionId     string    `json:"submission_id"`
	AssignmentId     string    `json:"assignment_id"`
	ClassroomId      string    `json:"classroom_id"`
	ClassroomName    string    `json:"classroom_name"`
	AssignmentTitle  string    `json:"assignment_title"`
	MahasiswaId      string    `json:"mahasiswa_id"`
	MahasiswaName    string    `json:"mahasiswa_name"`
	MahasiswaProfile string    `json:"mahasiswa_profile"`
	SubmissionDate   time.Time `json:"submission_date"`
}
