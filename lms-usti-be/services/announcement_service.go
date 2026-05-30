package services

import (
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
	Delete(announcementId, classroomId string) error
}

func NewAnnouncementService(announcementRepository repositories.AnnouncementRepositoryInterface, classroomRepository repositories.ClassroomRepositoryInterface) AnnouncementServiceInterface {
	return &AnnouncementService{announcementRepository: announcementRepository, classroomRepository: classroomRepository}
}

func (a *AnnouncementService) Create(announcementRequest data.AnnouncementRequest) error {
	classroom, err := a.classroomRepository.FindById(announcementRequest.ClassroomId)
	if err != nil {
		return err
	}
	announcement := model.Announcement{
		Title:       announcementRequest.Title,
		Content:     announcementRequest.Content,
		ClassroomId: classroom.ID,
		DosenId:     announcementRequest.DosenId,
	}
	if err := a.announcementRepository.Create(announcement); err != nil {
		return err
	}
	return nil
}
func (a *AnnouncementService) FindAll(classroomId string) (announcements []data.AnnouncementResponse, err error) {
	res, err := a.announcementRepository.FindAll(classroomId)
	for _, v := range res {
		announcement := data.AnnouncementResponse{
			Id:        v.ID,
			Title:     v.Title,
			Content:   v.Content,
			CreatedBy: v.Dosen.Fullname,
		}
		announcements = append(announcements, announcement)
	}
	if err != nil {
		return announcements, err
	}
	return announcements, nil
}
func (a *AnnouncementService) Delete(announcementId, classroomId string) error {
	err := a.announcementRepository.Delete(announcementId, classroomId)
	if err != nil {
		return err
	}
	return nil
}
