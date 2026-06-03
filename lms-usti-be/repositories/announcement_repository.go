package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type AnnouncementRepository struct {
	Db *gorm.DB
}
type AnnouncementRepositoryInterface interface {
	Create(announcement model.Announcement) error
	FindAll(classroomId string) (announcements []model.Announcement, err error)
	Delete(announcementId string, classroomId string) error
}

func NewAnnouncementRepository(Db *gorm.DB) AnnouncementRepositoryInterface {
	return &AnnouncementRepository{Db: Db}
}

func (a *AnnouncementRepository) Create(announcement model.Announcement) error {
	result := a.Db.Create(&announcement)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
func (a *AnnouncementRepository) FindAll(classroomId string) (announcements []model.Announcement, err error) {
	result := a.Db.Where("classroom_id = ?", classroomId).Preload("Dosen").Find(&announcements)
	if result.Error != nil {
		return []model.Announcement{}, result.Error
	}
	return announcements, nil
}
func (a *AnnouncementRepository) Delete(announcementId, classroomId string) error {
	res := a.Db.Where("id = ? AND classroom_id = ? ", announcementId, classroomId).Delete(model.Announcement{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
