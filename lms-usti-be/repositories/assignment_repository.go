package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type AssignmentRepository struct {
	Db *gorm.DB
}

type AssignmentRepositoryInterface interface {
	Create(assignment *model.Assignment) error
	CreateRubrics(assignmentRubric []model.AssignmentRubric) error
	CreateSubmissions(submissions []model.Submission) error
	FindAll(classroomId string) (assignments []model.Assignment, err error)
	FindAllClassroomMahasiswa(classroomId string) ([]model.ClassroomMahasiswa, error)
	FindById(assignmentId, classroomId string) (assignment model.Assignment, err error)
	Update(assignment model.Assignment) error
	Delete(assignmentId string, classroomId string) error
	DeleteRubrics(assignmentRubrics []model.AssignmentRubric) error
	Transaction(fn func(repo AssignmentRepositoryInterface) error) error
}

func NewAssignmentRepository(Db *gorm.DB) AssignmentRepositoryInterface {
	return &AssignmentRepository{Db: Db}
}

func (a *AssignmentRepository) Create(assignment *model.Assignment) error {
	result := a.Db.Create(assignment)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (a *AssignmentRepository) CreateRubrics(assignmentRubric []model.AssignmentRubric) error {
	result := a.Db.Create(assignmentRubric)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
func (a *AssignmentRepository) FindAll(classroomId string) (assignments []model.Assignment, err error) {
	result := a.Db.Where("classroom_id = ?", classroomId).Find(&assignments)
	if result.Error != nil {
		return assignments, result.Error
	}
	return assignments, nil
}

func (a *AssignmentRepository) FindById(assignmentId, classroomId string) (assignment model.Assignment, err error) {
	result := a.Db.Preload("Rubrics").Where("id = ? AND classroom_id = ?", assignmentId, classroomId).First(&assignment)
	if result.Error != nil {
		return model.Assignment{}, result.Error
	}
	return assignment, nil
}

func (a *AssignmentRepository) Update(assignment model.Assignment) error {
	res := a.Db.Where("id = ? AND classroom_id = ?", assignment.ID, assignment.ClassroomId).Model(&model.Assignment{}).Updates(assignment)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
func (a *AssignmentRepository) Delete(assignmentId, classroomId string) error {
	res := a.Db.Where("id = ? AND classroom_id = ? ", assignmentId, classroomId).Delete(model.Assignment{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
func (a *AssignmentRepository) FindAllClassroomMahasiswa(classroomId string) (mahasiswa []model.ClassroomMahasiswa, err error) {
	result := a.Db.Where("classroom_id = ?", classroomId).Find(&mahasiswa)
	if result.Error != nil {
		return []model.ClassroomMahasiswa{}, result.Error
	}
	return mahasiswa, nil
}

func (a *AssignmentRepository) CreateSubmissions(submissions []model.Submission) error {
	return a.Db.Create(&submissions).Error
}

func (a *AssignmentRepository) DeleteRubrics(assignmentRubrics []model.AssignmentRubric) error {
	res := a.Db.Delete(&assignmentRubrics)
	if res.Error != nil {
		return res.Error
	}
	return nil
}

func (a *AssignmentRepository) withTx(tx *gorm.DB) AssignmentRepositoryInterface {
	return &AssignmentRepository{Db: tx}
}

func (a *AssignmentRepository) Transaction(
	fn func(repo AssignmentRepositoryInterface) error) error {
	tx := a.Db.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	repo := a.withTx(tx)
	err := fn(repo)
	if err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
}
