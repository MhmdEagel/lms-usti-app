package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type ClassroomPolicyRepository struct {
	Db *gorm.DB
}

type ClassroomPolicyRepositoryInterface interface {
	FindByClassroomId(classroomID string) (model.ClassroomPolicy, error)
	Create(policy model.ClassroomPolicy) error
	Update(policy model.ClassroomPolicy) error
}

func NewClassroomPolicyRepository(Db *gorm.DB) ClassroomPolicyRepositoryInterface {
	return &ClassroomPolicyRepository{Db: Db}
}

func (r *ClassroomPolicyRepository) FindByClassroomId(classroomID string) (model.ClassroomPolicy, error) {
	var policy model.ClassroomPolicy
	err := r.Db.Where("classroom_id = ?", classroomID).First(&policy).Error
	return policy, err
}

func (r *ClassroomPolicyRepository) Create(policy model.ClassroomPolicy) error {
	return r.Db.Create(&policy).Error
}

func (r *ClassroomPolicyRepository) Update(policy model.ClassroomPolicy) error {
	return r.Db.Where("classroom_id = ?", policy.ClassroomID).Updates(&policy).Error
}
