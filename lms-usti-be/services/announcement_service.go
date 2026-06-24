package services

import (
	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
)

type AnnouncementService struct {
	announcementRepository repositories.AnnouncementRepositoryInterface
	classroomRepository    repositories.ClassroomRepositoryInterface
}

type AnnouncementServiceInterface interface {
	Create(announcementRequest data.AnnouncementRequest) error
	FindAll(classroomId string) (announcements []data.AnnouncementResponse, err error)
	Update(announcementId, classroomId string, req data.AnnouncementUpdateRequest) error
	Delete(announcementId, classroomId string) error
}

func NewAnnouncementService(announcementRepository repositories.AnnouncementRepositoryInterface, classroomRepository repositories.ClassroomRepositoryInterface) AnnouncementServiceInterface {
	return &AnnouncementService{announcementRepository: announcementRepository, classroomRepository: classroomRepository}
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
func (a *AnnouncementService) FindAll(classroomId string) (announcements []data.AnnouncementResponse, err error) {
	if _, err := a.classroomRepository.FindById(classroomId); err != nil {
		return nil, data.ErrClassroomNotFound(err)
	}
	res, err := a.announcementRepository.FindAll(classroomId)
	if err != nil {
		return nil, data.ErrInternalServer(err)
	}
	for _, v := range res {
		announcement := data.AnnouncementResponse{
			Id:        v.ID,
			Title:     v.Title,
			Content:   v.Content,
			IsPinned:  v.IsPinned,
			CreatedBy: v.Dosen.Fullname,
			CreatedAt: v.CreatedAt.Format(time.RFC3339Nano),
		}
		announcements = append(announcements, announcement)
	}
	return announcements, nil
}
func (a *AnnouncementService) Update(announcementId, classroomId string, req data.AnnouncementUpdateRequest) error {
	if _, err := a.classroomRepository.FindById(classroomId); err != nil {
		return data.ErrClassroomNotFound(err)
	}
	announcement, err := a.announcementRepository.FindById(announcementId)
	if err != nil {
		return data.ErrAnnouncementNotFound(err)
	}
	announcement.IsPinned = req.IsPinned
	if err := a.announcementRepository.Update(announcement); err != nil {
		return data.ErrInternalServer(err)
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
