package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type CommentRepository struct {
	Db *gorm.DB
}

type CommentRepositoryInterface interface {
	FindAll(commentableType, commentableId string) ([]model.Comment, error)
	Create(comment model.Comment) error
	Delete(commentId, createdBy string) error
	DeleteByID(commentId string) error
}

func NewCommentRepository(Db *gorm.DB) CommentRepositoryInterface {
	return &CommentRepository{Db: Db}
}

func (c *CommentRepository) FindAll(commentableType, commentableId string) ([]model.Comment, error) {
	var comments []model.Comment
	err := c.Db.Where("commentable_type = ? AND commentable_id = ?", commentableType, commentableId).
		Preload("User").
		Order("created_at ASC").
		Find(&comments).Error
	if err != nil {
		return nil, err
	}
	return comments, nil
}

func (c *CommentRepository) Create(comment model.Comment) error {
	return c.Db.Create(&comment).Error
}

func (c *CommentRepository) Delete(commentId, createdBy string) error {
	res := c.Db.Where("id = ? AND created_by = ?", commentId, createdBy).Delete(model.Comment{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (c *CommentRepository) DeleteByID(commentId string) error {
	res := c.Db.Where("id = ?", commentId).Delete(model.Comment{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
