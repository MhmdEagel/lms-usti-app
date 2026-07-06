package repositories

import (
	"strings"

	"gorm.io/gorm"

	"github.com/MhmdEagel/lms-usti-be/model"
)

type ContentViewRepository struct {
	Db *gorm.DB
}

type ContentViewRepositoryInterface interface {
	HasViewed(userID, viewableType, viewableID string) (bool, error)
	RecordView(userID, viewableType, viewableID string) error
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
	err := r.Db.Create(&view).Error
	if err != nil {
		if isDuplicateEntry(err) {
			return nil
		}
		return err
	}
	return nil
}

func isDuplicateEntry(err error) bool {
	return err != nil && (gorm.ErrDuplicatedKey.Error() == err.Error() ||
		strings.Contains(err.Error(), "Duplicate entry") ||
		strings.Contains(err.Error(), "UNIQUE constraint"))
}
