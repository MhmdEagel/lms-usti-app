package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type AnnouncementRepository struct {
	Db *gorm.DB
}
type AnnouncementRepositoryInterface interface {
	Create(announcement model.Announcement) error
	FindAll(classroomId string, search string, pagination data.Pagination) (result *data.PaginationWithData, err error)
	FindById(announcementId string) (model.Announcement, error)
	Update(announcement model.Announcement) error
	UpdateIsPinned(announcementId, classroomId string, isPinned bool) error
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
func (a *AnnouncementRepository) FindAll(classroomId string, search string, pagination data.Pagination) (result *data.PaginationWithData, err error) {
	var announcements []model.Announcement
	result = &data.PaginationWithData{Pagination: pagination}
	query := a.Db.Where("classroom_id = ?", classroomId).Preload("Dosen")
	if search != "" {
		query = query.Where("title LIKE ?", "%"+search+"%")
	}
	if err := query.Scopes(lib.Paginate(announcements, &pagination, query)).Find(&announcements).Error; err != nil {
		return nil, err
	}
	result.Data = announcements
	result.Pagination = pagination
	return result, nil
}
func (a *AnnouncementRepository) FindById(announcementId string) (model.Announcement, error) {
	var announcement model.Announcement
	result := a.Db.Preload("Dosen").Preload("Classroom").First(&announcement, "id = ?", announcementId)
	if result.Error != nil {
		return model.Announcement{}, result.Error
	}
	return announcement, nil
}
func (a *AnnouncementRepository) Update(announcement model.Announcement) error {
	result := a.Db.Save(&announcement)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
func (a *AnnouncementRepository) UpdateIsPinned(announcementId, classroomId string, isPinned bool) error {
	result := a.Db.Model(&model.Announcement{}).
		Where("id = ? AND classroom_id = ?", announcementId, classroomId).
		Update("is_pinned", isPinned)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
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
