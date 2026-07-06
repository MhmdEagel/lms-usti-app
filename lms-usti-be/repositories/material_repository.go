package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type MaterialRepository struct {
	Db *gorm.DB
}

type MaterialRepositoryInterface interface {
	Create(material *model.Material) error
	CreateAttachments(attachments []model.MaterialAttachment) error
	FindAll(classroomId string, search string, pagination data.Pagination) (result *data.PaginationWithData, err error)
	FindById(materialId string) (material model.Material, err error)
	Update(material model.Material) error
	Delete(materialId, classroomId string) error
	DeleteAttachments(materialId string) error
	Transaction(fn func(repo MaterialRepositoryInterface) error) error
}

func NewMaterialRepository(Db *gorm.DB) MaterialRepositoryInterface {
	return &MaterialRepository{Db: Db}
}
func (m *MaterialRepository) Create(material *model.Material) error {
	result := m.Db.Create(material)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
func (m *MaterialRepository) CreateAttachments(attachments []model.MaterialAttachment) error {
	result := m.Db.Create(&attachments)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
func (m *MaterialRepository) Update(material model.Material) error {
	res := m.Db.Where("id = ?", material.ID).Model(&model.Material{}).Updates(material)
	if res.Error != nil {
		return res.Error
	}
	return nil
}
func (m *MaterialRepository) FindAll(classroomId string, search string, pagination data.Pagination) (result *data.PaginationWithData, err error) {
	var materials []model.Material
	result = &data.PaginationWithData{Pagination: pagination}
	query := m.Db.Where("classroom_id = ?", classroomId).Order("created_at DESC")
	if search != "" {
		query = query.Where("title LIKE ?", "%"+search+"%")
	}
	if err := query.Scopes(lib.Paginate(materials, &pagination, query)).Find(&materials).Error; err != nil {
		return nil, err
	}
	result.Data = materials
	result.Pagination = pagination
	return result, nil
}
func (m *MaterialRepository) FindById(materialId string) (material model.Material, err error) {
	result := m.Db.Where("id = ?", materialId).Preload("Attachments").First(&material)
	if result.Error != nil {
		return model.Material{}, result.Error
	}
	return material, nil
}
func (m *MaterialRepository) Delete(materialId, classroomId string) error {
	res := m.Db.Where("id = ? AND classroom_id = ?", materialId, classroomId).Delete(model.Material{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
func (m *MaterialRepository) DeleteAttachments(materialId string) error {
	res := m.Db.Where("material_id = ?", materialId).Delete(&model.MaterialAttachment{})
	if res.Error != nil {
		return res.Error
	}
	return nil
}
func (m *MaterialRepository) withTx(tx *gorm.DB) MaterialRepositoryInterface {
	return &MaterialRepository{Db: tx}
}

func (m *MaterialRepository) Transaction(
	fn func(materialRepo MaterialRepositoryInterface) error) error {
	tx := m.Db.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	repo := m.withTx(tx)
	err := fn(repo)
	if err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
}
