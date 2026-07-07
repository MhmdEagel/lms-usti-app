package services

import (
	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"gorm.io/gorm"
)

type AnnouncementService struct {
	announcementRepository repositories.AnnouncementRepositoryInterface
	classroomRepository    repositories.ClassroomRepositoryInterface
	commentRepository      repositories.CommentRepositoryInterface
}

type AnnouncementServiceInterface interface {
	Create(announcementRequest data.AnnouncementRequest) error
	FindAll(classroomId string, search string, pagination data.Pagination) (paginatedResult *data.PaginationWithData, err error)
	FindById(announcementId, classroomId string) (data.AnnouncementResponse, error)
	Update(announcementId, classroomId string, req data.AnnouncementUpdateRequest) error
	Delete(announcementId, classroomId string) error
}

func NewAnnouncementService(announcementRepository repositories.AnnouncementRepositoryInterface, classroomRepository repositories.ClassroomRepositoryInterface, commentRepository repositories.CommentRepositoryInterface) AnnouncementServiceInterface {
	return &AnnouncementService{announcementRepository: announcementRepository, classroomRepository: classroomRepository, commentRepository: commentRepository}
}

func (a *AnnouncementService) Create(announcementRequest data.AnnouncementRequest) error {
	classroom, err := a.classroomRepository.FindById(announcementRequest.ClassroomId)
	if err != nil {
		return data.ErrClassroomNotFound(err)
	}
	announcement := model.Announcement{
		Title:       announcementRequest.Title,
		Content:     announcementRequest.Content,
		ClassroomId: classroom.ID,
		DosenId:     announcementRequest.DosenId,
	}
	if err := a.announcementRepository.Create(announcement); err != nil {
		return data.ErrInternalServer(err)
	}
	return nil
}
func (a *AnnouncementService) FindAll(classroomId string, search string, pagination data.Pagination) (paginatedResult *data.PaginationWithData, err error) {
	if _, err := a.classroomRepository.FindById(classroomId); err != nil {
		return nil, data.ErrClassroomNotFound(err)
	}
	paginatedResult, err = a.announcementRepository.FindAll(classroomId, search, pagination)
	if err != nil {
		return nil, data.ErrInternalServer(err)
	}
	announcements := paginatedResult.Data.([]model.Announcement)
	var ids []string
	for _, v := range announcements {
		ids = append(ids, v.ID)
	}
	counts, _ := a.commentRepository.CountByCommentableBatch(model.CommentableTypeAnnouncement, ids)
	var announcementResponses []data.AnnouncementResponse
	for _, v := range announcements {
		announcement := data.AnnouncementResponse{
			Id:            v.ID,
			Title:         v.Title,
			Content:       v.Content,
			IsPinned:      v.IsPinned,
			ClassroomName: v.Classroom.ClassName,
			CreatedBy:     v.Dosen.Fullname,
			CreatedAt:     v.CreatedAt.Format(time.RFC3339Nano),
			CommentCount:  counts[v.ID],
		}
		announcementResponses = append(announcementResponses, announcement)
	}
	paginatedResult.Data = announcementResponses
	return paginatedResult, nil
}
func (a *AnnouncementService) FindById(announcementId, classroomId string) (data.AnnouncementResponse, error) {
	if _, err := a.classroomRepository.FindById(classroomId); err != nil {
		return data.AnnouncementResponse{}, data.ErrClassroomNotFound(err)
	}
	announcement, err := a.announcementRepository.FindById(announcementId)
	if err != nil {
		return data.AnnouncementResponse{}, data.ErrAnnouncementNotFound(err)
	}
	counts, _ := a.commentRepository.CountByCommentableBatch(model.CommentableTypeAnnouncement, []string{announcementId})
	count := counts[announcementId]
	return data.AnnouncementResponse{
		Id:            announcement.ID,
		Title:         announcement.Title,
		Content:       announcement.Content,
		IsPinned:      announcement.IsPinned,
		ClassroomName: announcement.Classroom.ClassName,
		CreatedBy:     announcement.Dosen.Fullname,
		CreatedAt:     announcement.CreatedAt.Format(time.RFC3339Nano),
		CommentCount:  count,
	}, nil
}

func (a *AnnouncementService) Update(announcementId, classroomId string, req data.AnnouncementUpdateRequest) error {
	if _, err := a.classroomRepository.FindById(classroomId); err != nil {
		return data.ErrClassroomNotFound(err)
	}

	if req.IsPinned != nil {
		if err := a.announcementRepository.UpdateIsPinned(announcementId, classroomId, *req.IsPinned); err != nil {
			if err == gorm.ErrRecordNotFound {
				return data.ErrAnnouncementNotFound(err)
			}
			return data.ErrInternalServer(err)
		}
	}

	if req.Title != nil || req.Content != nil {
		announcement, err := a.announcementRepository.FindById(announcementId)
		if err != nil {
			return data.ErrAnnouncementNotFound(err)
		}
		if req.Title != nil {
			announcement.Title = *req.Title
		}
		if req.Content != nil {
			announcement.Content = *req.Content
		}
		if err := a.announcementRepository.Update(announcement); err != nil {
			return data.ErrInternalServer(err)
		}
	}

	return nil
}
func (a *AnnouncementService) Delete(announcementId, classroomId string) error {
	err := a.announcementRepository.Delete(announcementId, classroomId)
	if err != nil {
		return data.ErrAnnouncementNotFound(err)
	}
	return nil
}
