package services

import (
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
)

type AssignmentService struct {
	assignmentRepository repositories.AssignmentRepositoryInterface
	classroomRepository  repositories.ClassroomRepositoryInterface
	submissionService    SubmissionServiceInterface
}

type AssignmentServiceInterface interface {
	Create(assignmentRequest data.AssignmentRequest) error
	FindAll(classroomId string) (assignments []data.AssignmentResponse, err error)
	FindById(assignmentId, classroomId string) (assignment data.AssignmentDetailResponse, err error)
	Update(assignmentRequest data.AssignmentUpdateRequest) error
	Delete(assignmentId, classroomId string) error
}

func NewAssignmentService(assignmentRepository repositories.AssignmentRepositoryInterface, classroomRepository repositories.ClassroomRepositoryInterface, submissionService SubmissionServiceInterface) AssignmentServiceInterface {
	return &AssignmentService{assignmentRepository: assignmentRepository, classroomRepository: classroomRepository, submissionService: submissionService}
}
func (a *AssignmentService) Create(assignmentRequest data.AssignmentRequest) error {
	classroom, err := a.classroomRepository.FindById(assignmentRequest.ClassroomId)
	if err != nil {
		return err
	}
	assignment := &model.Assignment{
		Title:       assignmentRequest.Title,
		Deadline:    assignmentRequest.Deadline,
		Instruction: assignmentRequest.Instruction,
		ClassroomId: classroom.ID,
	}
	if err := a.assignmentRepository.Create(assignment); err != nil {
		return err
	}
	var assignmentRubrics []model.AssignmentRubric
	for _, v := range assignmentRequest.Rubrics {
		assignmentRubric := model.AssignmentRubric{
			Name:         v.Name,
			Score:        v.Score,
			AssignmentId: assignment.ID,
		}
		assignmentRubrics = append(assignmentRubrics, assignmentRubric)
	}

	if len(assignmentRubrics) > 0 {
		if err := a.assignmentRepository.CreateRubrics(assignmentRubrics); err != nil {
			return err
		}
	}
	classroomMembers, err := a.classroomRepository.FindAllClassroomMahasiswa(classroom.ID)
	if err != nil {
		return err
	}
	var submissions []data.SubmissionRequest
	for _, v := range classroomMembers {
		submissionData := data.SubmissionRequest{
			Status:         "not_submitted",
			SubmissionDate: nil,
			AssignmentId:   assignment.ID,
			StudentId:      v.UserId,
		}
		submissions = append(submissions, submissionData)
	}
	if len(submissions) > 0 {
		if err := a.submissionService.Create(submissions); err != nil {
			return err
		}
	}
	var assignmentAttachments []model.AssignmentAttachment
	for _, v := range assignmentRequest.Attachments {
		attType := model.AttachmentType(v.Type)
		if attType != model.AttachmentTypeFile && attType != model.AttachmentTypeVideo && attType != model.AttachmentTypeLink {
			return data.ErrBadRequest(nil)
		}
		if attType == model.AttachmentTypeFile || attType == model.AttachmentTypeVideo {
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
		if err := a.assignmentRepository.CreateAttachments(assignmentAttachments); err != nil {
			return err
		}
	}
	return nil
}

func (a *AssignmentService) FindAll(classroomId string) (assignments []data.AssignmentResponse, err error) {
	classroom, err := a.classroomRepository.FindById(classroomId)
	if err != nil {
		return assignments, err
	}
	res, err := a.assignmentRepository.FindAll(classroom.ID)
	for _, v := range res {
		assignment := data.AssignmentResponse{
			ID:          v.ID,
			Title:       v.Title,
			Instruction: v.Instruction,
			Deadline:    v.Deadline,
		}
		assignments = append(assignments, assignment)
	}
	if err != nil {
		return assignments, err
	}
	return assignments, nil
}

func (a *AssignmentService) FindById(assignmentId, classroomId string) (assignment data.AssignmentDetailResponse, err error) {
	classroom, err := a.classroomRepository.FindById(classroomId)
	if err != nil {
		return assignment, err
	}
	res, err := a.assignmentRepository.FindById(assignmentId, classroom.ID)
	if err != nil {
		return assignment, err
	}
	result := data.AssignmentDetailResponse{
		ID:          res.ID,
		Title:       res.Title,
		Deadline:    res.Deadline,
		Instruction: res.Instruction,
	}
	for _, v := range res.Rubrics {
		rubric := data.AssignmentRubricResponse{
			ID:    v.ID,
			Name:  v.Name,
			Score: v.Score,
		}
		result.Rubrics = append(result.Rubrics, rubric)
	}
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
		return err
	}
	return a.assignmentRepository.Transaction(
		func(repo repositories.AssignmentRepositoryInterface) error {
			res, err := repo.FindById(assignmentRequest.ID, classroom.ID)
			if err != nil {
				return err
			}
			res.Title = assignmentRequest.Title
			res.Instruction = assignmentRequest.Instruction
			res.Deadline = assignmentRequest.Deadline
			if err := repo.Update(res); err != nil {
				return err
			}
			var updatedRubrics []model.AssignmentRubric
			for _, v := range assignmentRequest.Rubrics {
				rubric := model.AssignmentRubric{
					Name:         v.Name,
					Score:        v.Score,
					AssignmentId: assignmentRequest.ID,
				}
				updatedRubrics = append(updatedRubrics, rubric)
			}

			if err := repo.DeleteRubrics(res.Rubrics); err != nil {
				return err
			}
			if len(updatedRubrics) > 0 {
				if err := repo.CreateRubrics(updatedRubrics); err != nil {
					return err
				}
			}
			var updatedAttachments []model.AssignmentAttachment
			for _, v := range assignmentRequest.Attachments {
				attachment := model.AssignmentAttachment{
					Name:         v.Name,
					Type:         model.AttachmentType(v.Type),
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
		return err
	}
	if err := a.assignmentRepository.Delete(assignmentId, classroom.ID); err != nil {
		return err
	}
	return nil
}
