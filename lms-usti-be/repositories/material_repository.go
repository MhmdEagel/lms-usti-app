package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type MaterialRepository struct {
	Db *gorm.DB
}

type MaterialRepositoryInterface interface {
	Create(material *model.Material) error
	CreateAttachments(attachments []model.MaterialAttachment) error
	FindAll(classroomId string) (materials []model.Material, err error)
	FindById(materialId string) (material model.Material, err error)
	Update(material model.Material) error
	Delete(materialId string) error
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
func (m *MaterialRepository) FindAll(classroomId string) (materials []model.Material, err error) {
	res := m.Db.Where("classroom_id = ?", classroomId).Find(&materials)
	if res.Error != nil {
		return []model.Material{}, res.Error
	}
	return materials, err
}
func (m *MaterialRepository) FindById(materialId string) (material model.Material, err error) {
	result := m.Db.Where("id = ?", materialId).Preload("Attachments").First(&material)
	if result.Error != nil {
		return model.Material{}, result.Error
	}
	return material, nil
}
func (m *MaterialRepository) Delete(materialId string) error {
	material, err := m.FindById(materialId)
	if err != nil {
		return err
	}
	res := m.Db.Where("id = ? ", material.ID).Delete(model.Material{})
	if res.Error != nil {
		return res.Error
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
