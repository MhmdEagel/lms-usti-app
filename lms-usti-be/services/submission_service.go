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
	Grade(classroomId, assignmentId, submissionId string, req data.GradeRequest) error
	GetSubmissionStats(assignmentId string) (data.SubmissionStatsResponse, error)
	GetSubmissionStatsBatch(assignmentIds []string) (map[string]data.SubmissionStatsResponse, error)
	IsAlreadyCreated(studentId string, classroomId string) bool
	GetClassroomGrades(classroomId string) ([]model.Submission, []model.Assignment, error)
	GetStudentGrades(classroomId string, studentId string) ([]model.Assignment, []model.Submission, error)
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
			Feedback:       v.Feedback,
			Mahasiswa: data.MahasiswaResponse{
				ID:       v.User.ID,
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
	var attachments []data.SubmissionAttachmentResponse
	for _, v := range res.Attachments {
		attachments = append(attachments, data.SubmissionAttachmentResponse{
			Name:       v.Name,
			Type:       string(v.Type),
			Url:        v.Url,
			UniqueName: v.UniqueName,
		})
	}
	result = data.SubmissionResponse{
		Id:             res.ID,
		Status:         res.Status,
		SubmissionDate: submit_date,
		Score:          res.Score,
		Feedback:       res.Feedback,
		Attachments:    attachments,
		Mahasiswa: data.MahasiswaResponse{
			ID:       res.User.ID,
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
			Name:       v.Name,
			Type:       string(v.Type),
			Url:        v.Url,
			UniqueName: v.UniqueName,
		}
		attachments = append(attachments, attachment)
	}
	submissionResponse := data.SubmissionDetailResponse{
		Mahasiswa: data.MahasiswaResponse{
			ID:       submission.User.ID,
			Fullname: submission.User.Fullname,
		},
		Attachments: attachments,
		Feedback:    submission.Feedback,
	}
	result = submissionResponse
	return result, nil
}
func (s *SubmissionService) Submit(submitReq data.SubmitRequest) error {
	assignment, err := s.assignmentRepository.FindById(submitReq.AssigmentId, submitReq.ClassroomId)
	if err != nil {
		return err
	}
	now := time.Now()
	if assignment.Deadline.Valid && lib.IsLate(now, assignment.Deadline.Time) && assignment.LateSubmission == "not_allowed" {
		return data.ErrDeadlinePassed(nil)
	}
	submission, err := s.submissionRepository.FindByAssignmentIdAndStudentId(assignment.ID, submitReq.ID)
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
			UniqueName:   v.UniqueName,
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

func (s *SubmissionService) Grade(classroomId, assignmentId, submissionId string, req data.GradeRequest) error {
	if _, err := s.assignmentRepository.FindById(assignmentId, classroomId); err != nil {
		return err
	}
	if err := s.submissionRepository.Grade(submissionId, req.Score, req.Feedback); err != nil {
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

func (s *SubmissionService) GetClassroomGrades(classroomId string) ([]model.Submission, []model.Assignment, error) {
	return s.submissionRepository.GetClassroomGrades(classroomId)
}

func (s *SubmissionService) GetStudentGrades(classroomId string, studentId string) ([]model.Assignment, []model.Submission, error) {
	return s.submissionRepository.GetStudentGrades(classroomId, studentId)
}
