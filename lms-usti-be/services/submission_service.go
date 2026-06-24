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
	FindAll(assignmentId string) (result []data.SubmissionResponse, err error)
	FindById(req data.SubmissionDetailRequest) (result data.SubmissionDetailResponse, err error)
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

func (s *SubmissionService) FindAll(assignmentId string) (result []data.SubmissionResponse, err error) {
	res, err := s.submissionRepository.FindAllByAssignmentId(assignmentId)
	if err != nil {
		return result, err
	}
	for _, v := range res {
		submit_date := lib.FromNullTime(v.SubmissionDate)
		submission := data.SubmissionResponse{
			Id:             v.ID,
			Status:         v.Status,
			SubmissionDate: submit_date,
			Mahasiswa: data.MahasiswaResponse{
				UserId:   v.User.ID,
				Fullname: v.User.Fullname,
			},
		}
		result = append(result, submission)
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
	var files []data.SubmissionFileResponse
	var links []data.SubmissionLinkResponse
	for _, v := range submission.SubmissionFiles {
		file := data.SubmissionFileResponse{
			FileName: v.FileName,
			FileUrl:  v.FileUrl,
		}
		files = append(files, file)
	}
	for _, v := range submission.SubmissionLinks {
		link := data.SubmissionLinkResponse{
			LinkName: v.LinkName,
			LinkUrl:  v.LinkUrl,
		}
		links = append(links, link)
	}
	submissionResponse := data.SubmissionDetailResponse{
		Mahasiswa: data.MahasiswaResponse{
			UserId:   submission.User.ID,
			Fullname: submission.User.Fullname,
		},
		Files: files,
		Links: links,
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
	if len(submission.SubmissionFiles) > 0 {
		if err := s.submissionRepository.DeleteFiles(submission.SubmissionFiles); err != nil {
			return err
		}
	}
	if len(submission.SubmissionLinks) > 0 {
		if err := s.submissionRepository.DeleteLinks(submission.SubmissionLinks); err != nil {
			return err
		}
	}
	var submitFiles []model.SubmissionFile
	for _, v := range submitReq.Files {
		file := model.SubmissionFile{
			FileName:     v.FileName,
			FileUrl:      v.FileUrl,
			SubmissionId: submission.ID,
		}
		submitFiles = append(submitFiles, file)
	}
	if len(submitFiles) > 0 {
		err := s.submissionRepository.CreateSubmissionFiles(submitFiles)
		if err != nil {
			return err
		}
	}
	var submitLinks []model.SubmissionLink
	for _, v := range submitReq.Links {
		link := model.SubmissionLink{
			LinkName:     v.LinkName,
			LinkUrl:      v.LinkUrl,
			SubmissionId: submission.ID,
		}
		submitLinks = append(submitLinks, link)
	}

	if len(submitLinks) > 0 {
		if err := s.submissionRepository.CreateSubmissionLinks(submitLinks); err != nil {
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
