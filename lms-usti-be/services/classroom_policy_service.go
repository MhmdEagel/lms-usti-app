package services

import (
	"gorm.io/gorm"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
)

type ClassroomPolicyService struct {
	classroomPolicyRepository repositories.ClassroomPolicyRepositoryInterface
}

type ClassroomPolicyServiceInterface interface {
	FindByClassroomId(classroomID string) (data.ClassroomPolicyResponse, error)
	Update(classroomID string, req data.ClassroomPolicyRequest) error
}

func NewClassroomPolicyService(classroomPolicyRepository repositories.ClassroomPolicyRepositoryInterface) ClassroomPolicyServiceInterface {
	return &ClassroomPolicyService{classroomPolicyRepository: classroomPolicyRepository}
}

func (s *ClassroomPolicyService) FindByClassroomId(classroomID string) (data.ClassroomPolicyResponse, error) {
	policy, err := s.classroomPolicyRepository.FindByClassroomId(classroomID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return data.ClassroomPolicyResponse{
				LateSubmission:    model.LateSubmissionAllow,
				ForumPermission:   model.ForumPermissionComment,
				CommentPermission: model.CommentPermissionActive,
			}, nil
		}
		return data.ClassroomPolicyResponse{}, data.ErrInternalServer(err)
	}
	return data.ClassroomPolicyResponse{
		LateSubmission:    policy.LateSubmission,
		ForumPermission:   policy.ForumPermission,
		CommentPermission: policy.CommentPermission,
	}, nil
}

func (s *ClassroomPolicyService) Update(classroomID string, req data.ClassroomPolicyRequest) error {
	_, err := s.classroomPolicyRepository.FindByClassroomId(classroomID)
	if err == gorm.ErrRecordNotFound {
		policy := model.ClassroomPolicy{
			ClassroomID:       classroomID,
			LateSubmission:    req.LateSubmission,
			ForumPermission:   req.ForumPermission,
			CommentPermission: req.CommentPermission,
		}
		return s.classroomPolicyRepository.Create(policy)
	}
	if err != nil {
		return data.ErrInternalServer(err)
	}
	policy := model.ClassroomPolicy{
		ClassroomID:       classroomID,
		LateSubmission:    req.LateSubmission,
		ForumPermission:   req.ForumPermission,
		CommentPermission: req.CommentPermission,
	}
	return s.classroomPolicyRepository.Update(policy)
}
