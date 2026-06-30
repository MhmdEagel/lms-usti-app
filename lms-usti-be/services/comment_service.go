package services

import (
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
)

type CommentService struct {
	commentRepository       repositories.CommentRepositoryInterface
	classroomRepository     repositories.ClassroomRepositoryInterface
	materialRepository      repositories.MaterialRepositoryInterface
	assignmentRepository    repositories.AssignmentRepositoryInterface
	announcementRepository  repositories.AnnouncementRepositoryInterface
}

type CommentServiceInterface interface {
	FindAll(commentableType, commentableId string) ([]data.CommentResponse, error)
	Create(req data.CommentRequest, commentableType, commentableId, userId, classroomId string) error
	Delete(commentId, userId string) error
	DeleteByID(commentId string) error
}

func NewCommentService(commentRepository repositories.CommentRepositoryInterface, classroomRepository repositories.ClassroomRepositoryInterface, materialRepository repositories.MaterialRepositoryInterface, assignmentRepository repositories.AssignmentRepositoryInterface, announcementRepository repositories.AnnouncementRepositoryInterface) CommentServiceInterface {
	return &CommentService{commentRepository: commentRepository, classroomRepository: classroomRepository, materialRepository: materialRepository, assignmentRepository: assignmentRepository, announcementRepository: announcementRepository}
}

func (c *CommentService) FindAll(commentableType, commentableId string) ([]data.CommentResponse, error) {
	res, err := c.commentRepository.FindAll(commentableType, commentableId)
	if err != nil {
		return nil, data.ErrInternalServer(err)
	}
	var comments []data.CommentResponse
	for _, v := range res {
		comments = append(comments, data.CommentResponse{
			ID:        v.ID,
			Content:   v.Content,
			CreatedBy: v.CreatedBy,
			User: data.CommentUserResponse{
				Fullname: v.User.Fullname,
				Profile:  v.User.Image,
			},
			CreatedAt: v.CreatedAt,
		})
	}
	return comments, nil
}

func (c *CommentService) Create(req data.CommentRequest, commentableType, commentableId, userId, classroomId string) error {
	switch commentableType {
	case model.CommentableTypeMaterial:
		if _, err := c.materialRepository.FindById(commentableId); err != nil {
			return data.ErrMaterialNotFound(err)
		}
	case model.CommentableTypeAssignment:
		if _, err := c.assignmentRepository.FindById(commentableId, classroomId); err != nil {
			return data.ErrAssignmentNotFound(err)
		}
	case model.CommentableTypeAnnouncement:
		if _, err := c.announcementRepository.FindById(commentableId); err != nil {
			return data.ErrAnnouncementNotFound(err)
		}
	default:
		return data.ErrBadRequest(nil)
	}
	if _, err := c.classroomRepository.FindById(classroomId); err != nil {
		return data.ErrClassroomNotFound(err)
	}
	comment := model.Comment{
		Content:         req.Content,
		CreatedBy:       userId,
		CommentableType: commentableType,
		CommentableID:   commentableId,
	}
	if err := c.commentRepository.Create(comment); err != nil {
		return data.ErrInternalServer(err)
	}
	return nil
}

func (c *CommentService) Delete(commentId, userId string) error {
	if err := c.commentRepository.Delete(commentId, userId); err != nil {
		return data.ErrCommentNotFound(err)
	}
	return nil
}

func (c *CommentService) DeleteByID(commentId string) error {
	if err := c.commentRepository.DeleteByID(commentId); err != nil {
		return data.ErrCommentNotFound(err)
	}
	return nil
}
