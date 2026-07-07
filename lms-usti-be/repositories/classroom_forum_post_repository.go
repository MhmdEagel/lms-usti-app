package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type ClassroomForumPostRepository struct {
	Db *gorm.DB
}
type ClassroomForumPostRepositoryInterface interface {
	Create(classroomForumPost model.ClassroomForumPost) error
	FindAll(classroomId string, search string, pagination data.Pagination) (result *data.PaginationWithData, err error)
	FindById(classroomForumPostId string) (model.ClassroomForumPost, error)
	Update(classroomForumPost model.ClassroomForumPost) error
	UpdateIsPinned(classroomForumPost, classroomId string, isPinned bool) error
	Delete(classroomForumPostId string, classroomId string) error
}

func NewClassroomForumPostRepository(Db *gorm.DB) ClassroomForumPostRepositoryInterface {
	return &ClassroomForumPostRepository{Db: Db}
}

func (a *ClassroomForumPostRepository) Create(classroomForumPost model.ClassroomForumPost) error {
	result := a.Db.Create(&classroomForumPost)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
func (a *ClassroomForumPostRepository) FindAll(classroomId string, search string, pagination data.Pagination) (result *data.PaginationWithData, err error) {
	var forumPost []model.ClassroomForumPost
	result = &data.PaginationWithData{Pagination: pagination}
	query := a.Db.Where("classroom_id = ?", classroomId).Preload("Dosen").Order("created_at DESC")
	if search != "" {
		query = query.Where("title LIKE ?", "%"+search+"%")
	}
	if err := query.Scopes(lib.Paginate(forumPost, &pagination, query)).Find(&forumPost).Error; err != nil {
		return nil, err
	}
	result.Data = forumPost
	result.Pagination = pagination
	return result, nil
}
func (a *ClassroomForumPostRepository) FindById(classroomForumPostId string) (model.ClassroomForumPost, error) {
	var forumPost model.ClassroomForumPost
	result := a.Db.Preload("Dosen").Preload("Classroom").First(&forumPost, "id = ?", classroomForumPostId)
	if result.Error != nil {
		return model.ClassroomForumPost{}, result.Error
	}
	return forumPost, nil
}
func (a *ClassroomForumPostRepository) Update(classroomForumPost model.ClassroomForumPost) error {
	res := a.Db.Where("id = ?", classroomForumPost.ID).Model(&model.ClassroomForumPost{}).Updates(classroomForumPost)
	if res.Error != nil {
		return res.Error
	}
	return nil
}
func (a *ClassroomForumPostRepository) UpdateIsPinned(classroomPostId, classroomId string, isPinned bool) error {
	result := a.Db.Model(&model.ClassroomForumPost{}).
		Where("id = ? AND classroom_id = ?", classroomPostId, classroomId).
		Update("is_pinned", isPinned)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (a *ClassroomForumPostRepository) Delete(classroomForumPostId, classroomId string) error {
	res := a.Db.Where("id = ? AND classroom_id = ? ", classroomForumPostId, classroomId).Delete(model.ClassroomForumPost{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
