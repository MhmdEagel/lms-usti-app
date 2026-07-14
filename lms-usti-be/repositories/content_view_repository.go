package repositories

import (
	"strings"

	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type ContentViewRepository struct {
	Db *gorm.DB
}

type ContentViewRepositoryInterface interface {
	HasViewed(userID, viewableType, viewableID string) (bool, error)
	RecordView(userID, viewableType, viewableID string) error
	TryRecordView(userID, viewableType, viewableID string) (bool, error)
	GetViewersByContent(viewableType, viewableID string) ([]model.User, error)
	CountViews(viewableType, viewableID string) (int64, error)
}

func NewContentViewRepository(Db *gorm.DB) ContentViewRepositoryInterface {
	return &ContentViewRepository{Db: Db}
}

func (r *ContentViewRepository) HasViewed(userID, viewableType, viewableID string) (bool, error) {
	var count int64
	err := r.Db.Model(&model.ContentView{}).
		Where("user_id = ? AND viewable_type = ? AND viewable_id = ?", userID, viewableType, viewableID).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *ContentViewRepository) RecordView(userID, viewableType, viewableID string) error {
	view := model.ContentView{
		UserID:       userID,
		ViewableType: viewableType,
		ViewableID:   viewableID,
	}
	return r.Db.Create(&view).Error
}

func (r *ContentViewRepository) TryRecordView(userID, viewableType, viewableID string) (bool, error) {
	view := model.ContentView{
		UserID:       userID,
		ViewableType: viewableType,
		ViewableID:   viewableID,
	}
	err := r.Db.Create(&view).Error
	if err != nil {
		if isDuplicateEntry(err) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (r *ContentViewRepository) GetViewersByContent(viewableType, viewableID string) ([]model.User, error) {
	var users []model.User
	err := r.Db.Model(&model.ContentView{}).
		Select("users.id, users.fullname, users.image, users.role").
		Joins("JOIN users ON users.id = content_views.user_id").
		Where("content_views.viewable_type = ? AND content_views.viewable_id = ?", viewableType, viewableID).
		Order("content_views.viewed_at DESC").
		Find(&users).Error
	return users, err
}

func (r *ContentViewRepository) CountViews(viewableType, viewableID string) (int64, error) {
	var count int64
	err := r.Db.Model(&model.ContentView{}).
		Where("viewable_type = ? AND viewable_id = ?", viewableType, viewableID).
		Count(&count).Error
	return count, err
}

func isDuplicateEntry(err error) bool {
	return err != nil && (gorm.ErrDuplicatedKey.Error() == err.Error() ||
		strings.Contains(err.Error(), "Duplicate entry") ||
		strings.Contains(err.Error(), "UNIQUE constraint"))
}
