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
	Files       []SubmissionFileRequest `json:"files"`
	Links       []SubmissionLinkRequest `json:"links"`
	AssigmentId string
	UserId      string
	ClassroomId string
}

type SubmissionFileRequest struct {
	FileName string `json:"file_name" binding:"required"`
	FileUrl  string `json:"file_url" binding:"required"`
}
type SubmissionLinkRequest struct {
	LinkName string `json:"link_name" binding:"required"`
	LinkUrl  string `json:"link_url" binding:"required"`
}
type SubmissionFileResponse struct {
	FileName string `json:"file_name"`
	FileUrl  string `json:"file_url"`
}
type SubmissionLinkResponse struct {
	LinkName string `json:"link_name"`
	LinkUrl  string `json:"link_url"`
}

type SubmissionStatsResponse struct {
	TotalStudents  int64 `json:"total_students"`
	TotalSubmitted int64 `json:"total_submitted"`
	TotalGraded    int64 `json:"total_graded"`
}

type SubmissionResponse struct {
	Id             string            `json:"id"`
	Status         string            `json:"status"`
	SubmissionDate *time.Time        `json:"submission_date"`
	Mahasiswa      MahasiswaResponse `json:"mahasiswa"`
}

type SubmissionDetailRequest struct {
	AssignmentId string
	ClassroomId  string
	SubmissionId string
}

type SubmissionDetailResponse struct {
	Mahasiswa MahasiswaResponse        `json:"mahasiswa"`
	Files     []SubmissionFileResponse `json:"files"`
	Links     []SubmissionLinkResponse `json:"links"`
}
