package data

import (
	"time"
)

type SubmissionRequest struct {
	Status         string     `json:"status"`
	SubmissionDate *time.Time `json:"submission_date"`
	StudentId      string
	AssignmentId   string
}

type SubmitRequest struct {
	Attachments []SubmissionAttachmentRequest `json:"attachments"`
	AssigmentId string
	UserId      string
	ClassroomId string
}

type SubmissionAttachmentRequest struct {
	Name       string `json:"name" binding:"required"`
	Type       string `json:"type" binding:"required,oneof=FILE VIDEO LINK"`
	Url        string `json:"url" binding:"required"`
	UniqueName string `json:"unique_name"`
}

type GradeRequest struct {
	Score    *float64 `json:"score"`
	Feedback *string  `json:"feedback"`
}

type SubmissionAttachmentResponse struct {
	Name       string `json:"name"`
	Type       string `json:"type"`
	Url        string `json:"url"`
	UniqueName string `json:"unique_name"`
}

type SubmissionStatsResponse struct {
	TotalStudents  int64 `json:"total_students"`
	TotalSubmitted int64 `json:"total_submitted"`
	TotalGraded    int64 `json:"total_graded"`
}

type SubmissionResponse struct {
	Id             string                      `json:"id"`
	Status         string                      `json:"status"`
	SubmissionDate *time.Time                  `json:"submission_date"`
	Score          *float64                    `json:"score"`
	Feedback       *string                     `json:"feedback"`
	Attachments    []SubmissionAttachmentResponse `json:"attachments,omitempty"`
	Mahasiswa      MahasiswaResponse           `json:"mahasiswa"`
}

type SubmissionDetailRequest struct {
	AssignmentId string
	ClassroomId  string
	SubmissionId string
}

type SubmissionDetailResponse struct {
	Mahasiswa   MahasiswaResponse              `json:"mahasiswa"`
	Attachments []SubmissionAttachmentResponse `json:"attachments"`
	Feedback    *string                        `json:"feedback"`
}
