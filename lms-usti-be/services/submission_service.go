package services

import (
	// "time"

	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
)

type SubmissionService struct {
	submissionRepository repositories.SubmissionRepositoryInterface
	assignmentRepository repositories.AssignmentRepositoryInterface
}
type SubmissionServiceInterface interface {
	Create(submissionReq []data.SubmissionRequest) error
	FindAll(classroomId string, assignmentId string, search string, filter string, pagination data.Pagination) (paginatedResult *data.PaginationWithData, err error)
	FindById(req data.SubmissionDetailRequest) (result data.SubmissionDetailResponse, err error)
	FindByAssignmentAndStudent(assignmentId, studentId string) (result data.SubmissionResponse, err error)
	Submit(submitReq data.SubmitRequest) error
	GetSubmissionStats(assignmentId string) (data.SubmissionStatsResponse, error)
	GetSubmissionStatsBatch(assignmentIds []string) (map[string]data.SubmissionStatsResponse, error)
	IsAlreadyCreated(studentId string, classroomId string) bool
}

func NewSubmissionService(submissionRepository repositories.SubmissionRepositoryInterface, assignmentRepository repositories.AssignmentRepositoryInterface) SubmissionServiceInterface {
	return &SubmissionService{submissionRepository: submissionRepository, assignmentRepository: assignmentRepository}
}
func (s *SubmissionService) Create(submissionReq []data.SubmissionRequest) error {
	var submissions []model.Submission
	for _, v := range submissionReq {
		submission := model.Submission{
			Status:         v.Status,
			SubmissionDate: lib.ToNullTime(v.SubmissionDate),
			StudentId:      v.StudentId,
			AssignmentId:   v.AssignmentId,
		}
		submissions = append(submissions, submission)
	}
	err := s.submissionRepository.Create(submissions)
	if err != nil {
		return err
	}
	return nil
}

func (s *SubmissionService) FindAll(classroomId string, assignmentId string, search string, filter string, pagination data.Pagination) (paginatedResult *data.PaginationWithData, err error) {
	paginatedResult, err = s.submissionRepository.FindAllByAssignmentId(classroomId, assignmentId, search, filter, pagination)
	if err != nil {
		return nil, err
	}
	var submissions []data.SubmissionResponse
	for _, v := range paginatedResult.Data.([]model.Submission) {
		submit_date := lib.FromNullTime(v.SubmissionDate)
		submission := data.SubmissionResponse{
			Id:             v.ID,
			Status:         v.Status,
			SubmissionDate: submit_date,
			Score:          v.Score,
			Mahasiswa: data.MahasiswaResponse{
				UserId:   v.User.ID,
				Profile:  v.User.Image,
				Fullname: v.User.Fullname,
			},
		}
		submissions = append(submissions, submission)
	}
	paginatedResult.Data = submissions
	return paginatedResult, nil
}
func (s *SubmissionService) FindByAssignmentAndStudent(assignmentId, studentId string) (result data.SubmissionResponse, err error) {
	res, err := s.submissionRepository.FindByAssignmentIdAndStudentId(assignmentId, studentId)
	if err != nil {
		return result, err
	}
	submit_date := lib.FromNullTime(res.SubmissionDate)
	result = data.SubmissionResponse{
		Id:             res.ID,
		Status:         res.Status,
		SubmissionDate: submit_date,
		Score:          res.Score,
		Mahasiswa: data.MahasiswaResponse{
			UserId:   res.User.ID,
			Fullname: res.User.Fullname,
		},
	}
	return result, nil
}
func (s *SubmissionService) FindById(req data.SubmissionDetailRequest) (result data.SubmissionDetailResponse, err error) {
	if _, err := s.assignmentRepository.FindById(req.AssignmentId, req.ClassroomId); err != nil {
		return result, err
	}
	submission, err := s.submissionRepository.FindById(req.SubmissionId)
	if err != nil {
		return result, err
	}
	var attachments []data.SubmissionAttachmentResponse
	for _, v := range submission.Attachments {
		attachment := data.SubmissionAttachmentResponse{
			Name: v.Name,
			Type: string(v.Type),
			Url:  v.Url,
		}
		attachments = append(attachments, attachment)
	}
	submissionResponse := data.SubmissionDetailResponse{
		Mahasiswa: data.MahasiswaResponse{
			UserId:   submission.User.ID,
			Fullname: submission.User.Fullname,
		},
		Attachments: attachments,
	}
	result = submissionResponse
	return result, nil
}
func (s *SubmissionService) Submit(submitReq data.SubmitRequest) error {
	assignment, err := s.assignmentRepository.FindById(submitReq.AssigmentId, submitReq.ClassroomId)
	if err != nil {
		return err
	}
	submission, err := s.submissionRepository.FindByAssignmentIdAndStudentId(assignment.ID, submitReq.UserId)
	if err != nil {
		return err
	}
	if len(submission.Attachments) > 0 {
		if err := s.submissionRepository.DeleteAttachments(submission.Attachments); err != nil {
			return err
		}
	}
	var submitAttachments []model.SubmissionAttachment
	for _, v := range submitReq.Attachments {
		attachment := model.SubmissionAttachment{
			Name:         v.Name,
			Type:         model.AttachmentType(v.Type),
			Url:          v.Url,
			SubmissionId: submission.ID,
		}
		submitAttachments = append(submitAttachments, attachment)
	}
	if len(submitAttachments) > 0 {
		err := s.submissionRepository.CreateAttachments(submitAttachments)
		if err != nil {
			return err
		}
	}
	now := time.Now()
	submitDate := lib.ToNullTime(&now)
	submitStatus := "submitted"
	updatedSubmission := model.Submission{
		ID:             submission.ID,
		SubmissionDate: submitDate,
		Status:         submitStatus,
	}
	if err := s.submissionRepository.Update(updatedSubmission); err != nil {
		return err
	}
	return nil
}

func (s *SubmissionService) GetSubmissionStats(assignmentId string) (data.SubmissionStatsResponse, error) {
	totalStudents, totalSubmitted, totalGraded, err := s.submissionRepository.GetSubmissionStats(assignmentId)
	if err != nil {
		return data.SubmissionStatsResponse{}, err
	}
	return data.SubmissionStatsResponse{
		TotalStudents:  totalStudents,
		TotalSubmitted: totalSubmitted,
		TotalGraded:    totalGraded,
	}, nil
}

func (s *SubmissionService) GetSubmissionStatsBatch(assignmentIds []string) (map[string]data.SubmissionStatsResponse, error) {
	return s.submissionRepository.GetSubmissionStatsBatch(assignmentIds)
}

func (s *SubmissionService) IsAlreadyCreated(studentId string, classroomId string) bool {
	return s.submissionRepository.IsAlreadyCreated(studentId, classroomId)
}
