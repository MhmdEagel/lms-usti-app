package services

import (
	"database/sql"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
)

type AssignmentService struct {
	assignmentRepository  repositories.AssignmentRepositoryInterface
	classroomRepository   repositories.ClassroomRepositoryInterface
	submissionService     SubmissionServiceInterface
	contentViewRepository repositories.ContentViewRepositoryInterface
}

type AssignmentServiceInterface interface {
	Create(assignmentRequest data.AssignmentRequest) error
	FindAll(classroomId string, search string, pagination data.Pagination, userID ...string) (paginatedResult *data.PaginationWithData, err error)
	FindById(assignmentId, classroomId, userID string) (assignment data.AssignmentDetailResponse, err error)
	Update(assignmentRequest data.AssignmentUpdateRequest) error
	Delete(assignmentId, classroomId string) error
	FindWaitingGrade(dosenId string) ([]data.AssignmentWaitingGradeResponse, error)
}

func NewAssignmentService(assignmentRepository repositories.AssignmentRepositoryInterface, classroomRepository repositories.ClassroomRepositoryInterface, submissionService SubmissionServiceInterface, contentViewRepository repositories.ContentViewRepositoryInterface) AssignmentServiceInterface {
	return &AssignmentService{assignmentRepository: assignmentRepository, classroomRepository: classroomRepository, submissionService: submissionService, contentViewRepository: contentViewRepository}
}
func (a *AssignmentService) Create(assignmentRequest data.AssignmentRequest) error {
	classroom, err := a.classroomRepository.FindById(assignmentRequest.ClassroomId)
	if err != nil {
		return data.ErrClassroomNotFound(err)
	}
	return a.assignmentRepository.Transaction(
		func(repo repositories.AssignmentRepositoryInterface) error {
			assignment := &model.Assignment{
				Title:       assignmentRequest.Title,
				Deadline:    lib.ToNullTime(assignmentRequest.Deadline),
				Instruction: assignmentRequest.Instruction,
				ClassroomId: classroom.ID,
			}
			if err := repo.Create(assignment); err != nil {
				return err
			}
			var assignmentAttachments []model.AssignmentAttachment
			for _, v := range assignmentRequest.Attachments {
				attType := model.AttachmentType(v.Type)
				if attType != model.AttachmentTypeFile && attType != model.AttachmentTypeLink {
					return data.ErrBadRequest(nil)
				}
				if attType == model.AttachmentTypeFile {
					if v.UniqueName == "" {
						return data.ErrBadRequest(nil)
					}
				}
				if attType == model.AttachmentTypeLink {
					if !lib.IsUrl(v.Url) {
						return data.ErrBadRequest(nil)
					}
				}
				attachment := model.AssignmentAttachment{
					Name:         v.Name,
					Type:         attType,
					Url:          v.Url,
					UniqueName:   v.UniqueName,
					AssignmentId: assignment.ID,
				}
				assignmentAttachments = append(assignmentAttachments, attachment)
			}
			if len(assignmentAttachments) > 0 {
				if err := repo.CreateAttachments(assignmentAttachments); err != nil {
					return err
				}
			}
			classroomMembers, err := repo.FindAllClassroomMahasiswa(classroom.ID)
			if err != nil {
				return err
			}
			var modelSubmissions []model.Submission
			for _, v := range classroomMembers {
				modelSubmission := model.Submission{
					Status:         "not_submitted",
					SubmissionDate: sql.NullTime{},
					AssignmentId:   assignment.ID,
					StudentId:      v.UserId,
				}
				modelSubmissions = append(modelSubmissions, modelSubmission)
			}
			if len(modelSubmissions) > 0 {
				if err := repo.CreateSubmissions(modelSubmissions); err != nil {
					return err
				}
			}
			return nil
		})
}

func (a *AssignmentService) FindAll(classroomId string, search string, pagination data.Pagination, userID ...string) (paginatedResult *data.PaginationWithData, err error) {
	classroom, err := a.classroomRepository.FindById(classroomId)
	if err != nil {
		return nil, data.ErrClassroomNotFound(err)
	}
	paginatedResult, err = a.assignmentRepository.FindAll(classroom.ID, search, pagination)
	if err != nil {
		return nil, err
	}
	assignmentModels := paginatedResult.Data.([]model.Assignment)
	assignmentIds := make([]string, len(assignmentModels))
	for i, v := range assignmentModels {
		assignmentIds[i] = v.ID
	}
	statsMap, _ := a.submissionService.GetSubmissionStatsBatch(assignmentIds)
	var assignments []data.AssignmentResponse
	for _, v := range assignmentModels {
		stats := statsMap[v.ID]
			assignment := data.AssignmentResponse{
				ID:                 v.ID,
				Title:              v.Title,
				Instruction:        v.Instruction,
				Deadline:           lib.FromNullTime(v.Deadline),
				Stats:              &stats,
				MySubmissionStatus: "",
				MyScore:            nil,
				MySubmissionDate:   nil,
			}
			if len(userID) > 0 && userID[0] != "" {
				submission, subErr := a.submissionService.FindByAssignmentAndStudent(v.ID, userID[0])
				if subErr == nil {
					assignment.MySubmissionStatus = submission.Status
					assignment.MyScore = submission.Score
					assignment.MySubmissionDate = submission.SubmissionDate
				}
			}
		assignments = append(assignments, assignment)
	}
	paginatedResult.Data = assignments
	return paginatedResult, nil
}

func (a *AssignmentService) FindById(assignmentId, classroomId, userID string) (assignment data.AssignmentDetailResponse, err error) {
	classroom, err := a.classroomRepository.FindById(classroomId)
	if err != nil {
		return assignment, data.ErrClassroomNotFound(err)
	}
	res, err := a.assignmentRepository.FindById(assignmentId, classroom.ID)
	if err != nil {
		return assignment, data.ErrAssignmentNotFound(err)
	}
	hasViewed, err := a.contentViewRepository.HasViewed(userID, model.ViewableTypeAssignment, assignmentId)
	if err != nil {
		return assignment, data.ErrInternalServer(err)
	}
	viewCount := res.ViewCount
	if !hasViewed {
		if err := a.contentViewRepository.RecordView(userID, model.ViewableTypeAssignment, assignmentId); err != nil {
			return assignment, data.ErrInternalServer(err)
		}
		if err := a.assignmentRepository.IncrementViewCount(assignmentId); err != nil {
			return assignment, data.ErrInternalServer(err)
		}
		viewCount++
	}
	result := data.AssignmentDetailResponse{
		ID:            res.ID,
		Title:         res.Title,
		Deadline:      lib.FromNullTime(res.Deadline),
		Instruction:   res.Instruction,
		ClassroomName: classroom.ClassName,
		ViewCount:     int(viewCount),
	}
	stats, _ := a.submissionService.GetSubmissionStats(assignmentId)
	result.Stats = &stats
	for _, v := range res.Attachments {
		attachment := data.AttachmentResponse{
			Id:         v.ID,
			Name:       v.Name,
			Type:       string(v.Type),
			Url:        v.Url,
			UniqueName: v.UniqueName,
		}
		result.Attachments = append(result.Attachments, attachment)
	}
	assignment = result
	return assignment, nil
}

func (a *AssignmentService) Update(assignmentRequest data.AssignmentUpdateRequest) error {
	classroom, err := a.classroomRepository.FindById(assignmentRequest.ClassroomId)
	if err != nil {
		return data.ErrClassroomNotFound(err)
	}
	return a.assignmentRepository.Transaction(
		func(repo repositories.AssignmentRepositoryInterface) error {
			res, err := repo.FindById(assignmentRequest.ID, classroom.ID)
			if err != nil {
				return data.ErrAssignmentNotFound(err)
			}
			if assignmentRequest.Title != nil {
				res.Title = *assignmentRequest.Title
			}
			if assignmentRequest.Instruction != nil {
				res.Instruction = *assignmentRequest.Instruction
			}
			res.Deadline = lib.ToNullTime(assignmentRequest.Deadline)
			if err := repo.Update(res); err != nil {
				return err
			}
			var updatedAttachments []model.AssignmentAttachment
			for _, v := range assignmentRequest.Attachments {
				attType := model.AttachmentType(v.Type)
				if attType != model.AttachmentTypeFile && attType != model.AttachmentTypeLink {
					return data.ErrBadRequest(nil)
				}
				if attType == model.AttachmentTypeFile {
					if v.UniqueName == "" {
						return data.ErrBadRequest(nil)
					}
				}
				if attType == model.AttachmentTypeLink {
					if !lib.IsUrl(v.Url) {
						return data.ErrBadRequest(nil)
					}
				}
				attachment := model.AssignmentAttachment{
					Name:         v.Name,
					Type:         attType,
					Url:          v.Url,
					UniqueName:   v.UniqueName,
					AssignmentId: assignmentRequest.ID,
				}
				updatedAttachments = append(updatedAttachments, attachment)
			}
			if err := repo.DeleteAttachments(assignmentRequest.ID); err != nil {
				return err
			}
			if len(updatedAttachments) > 0 {
				if err := repo.CreateAttachments(updatedAttachments); err != nil {
					return err
				}
			}
			return nil
		})
}
func (a *AssignmentService) Delete(assignmentId, classroomId string) error {
	classroom, err := a.classroomRepository.FindById(classroomId)
	if err != nil {
		return data.ErrClassroomNotFound(err)
	}
	if err := a.assignmentRepository.Delete(assignmentId, classroom.ID); err != nil {
		return data.ErrAssignmentNotFound(err)
	}
	return nil
}

func (a *AssignmentService) FindWaitingGrade(dosenId string) ([]data.AssignmentWaitingGradeResponse, error) {
	return a.assignmentRepository.FindWaitingGrade(dosenId)
}
