package data

import "time"

type AssignmentRequest struct {
	Title       string              `json:"title" binding:"required"`
	Deadline    *time.Time          `json:"deadline"`
	Instruction string              `json:"instruction"`
	Attachments []AttachmentRequest `json:"attachments"`
	ClassroomId string
}
type AssignmentUpdateRequest struct {
	ID          string
	Title       *string             `json:"title"`
	Deadline    *time.Time          `json:"deadline"`
	Instruction *string             `json:"instruction"`
	Attachments []AttachmentRequest `json:"attachments"`
	ClassroomId string
}
type AssignmentDetailResponse struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	ClassroomName string    `json:"classroom_name"`
	Deadline      *time.Time `json:"deadline"`
	Instruction   string    `json:"instruction"`
	ViewCount     int       `json:"view_count"`
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
