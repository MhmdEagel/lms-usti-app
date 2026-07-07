package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type ForumRepository struct {
	Db *gorm.DB
}

type ForumRepositoryInterface interface {
	Create(post model.ForumPost) error
	FindAll() ([]model.ForumPost, error)
	FindById(id string) (model.ForumPost, error)
	Delete(id string, userID string) error
	DeleteByID(id string) error
}

func NewForumRepository(Db *gorm.DB) ForumRepositoryInterface {
	return &ForumRepository{Db: Db}
}

func (f *ForumRepository) Create(post model.ForumPost) error {
	result := f.Db.Create(&post)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (f *ForumRepository) FindAll() ([]model.ForumPost, error) {
	var posts []model.ForumPost
	result := f.Db.Order("is_pinned DESC, created_at DESC").Preload("Author").Find(&posts)
	if result.Error != nil {
		return []model.ForumPost{}, result.Error
	}
	return posts, nil
}

func (f *ForumRepository) FindById(id string) (model.ForumPost, error) {
	var post model.ForumPost
	result := f.Db.Preload("Author").First(&post, "id = ?", id)
	if result.Error != nil {
		return model.ForumPost{}, result.Error
	}
	return post, nil
}

func (f *ForumRepository) Delete(id, userID string) error {
	res := f.Db.Where("id = ? AND created_by = ?", id, userID).Delete(&model.ForumPost{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (f *ForumRepository) DeleteByID(id string) error {
	res := f.Db.Delete(&model.ForumPost{}, "id = ?", id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}


