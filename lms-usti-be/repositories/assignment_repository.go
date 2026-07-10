package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type AssignmentRepository struct {
	Db *gorm.DB
}

type AssignmentRepositoryInterface interface {
	Create(assignment *model.Assignment) error
	CreateAttachments(attachments []model.AssignmentAttachment) error
	CreateSubmissions(submissions []model.Submission) error
	FindAll(classroomId string, search string, pagination data.Pagination) (result *data.PaginationWithData, err error)
	FindAllClassroomMahasiswa(classroomId string) ([]model.ClassroomMahasiswa, error)
	FindById(assignmentId, classroomId string) (assignment model.Assignment, err error)
	Update(assignment model.Assignment) error
	Delete(assignmentId string, classroomId string) error
	DeleteAttachments(assignmentId string) error
	IncrementViewCount(assignmentID string) error
	GetViewCountBatch(assignmentIDs []string) (map[string]int64, error)
	Transaction(fn func(repo AssignmentRepositoryInterface) error) error
	FindWaitingGrade(dosenId string) ([]data.AssignmentWaitingGradeResponse, error)
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

func (a *AssignmentRepository) FindAll(classroomId string, search string, pagination data.Pagination) (result *data.PaginationWithData, err error) {
	var assignments []model.Assignment
	result = &data.PaginationWithData{Pagination: pagination}
	query := a.Db.Where("classroom_id = ?", classroomId).Order("created_at DESC")
	if search != "" {
		query = query.Where("title LIKE ?", "%"+search+"%")
	}
	if err := query.Scopes(lib.Paginate(assignments, &pagination, query)).Find(&assignments).Error; err != nil {
		return nil, err
	}
	result.Data = assignments
	result.Pagination = pagination
	return result, nil
}

func (a *AssignmentRepository) FindById(assignmentId, classroomId string) (assignment model.Assignment, err error) {
	result := a.Db.Preload("Attachments").Where("id = ? AND classroom_id = ?", assignmentId, classroomId).First(&assignment)
	if result.Error != nil {
		return model.Assignment{}, result.Error
	}
	return assignment, nil
}

func (a *AssignmentRepository) Update(assignment model.Assignment) error {
	res := a.Db.Where("id = ? AND classroom_id = ?", assignment.ID, assignment.ClassroomId).Model(&model.Assignment{}).Select("Title", "Deadline", "Instruction").Updates(assignment)
	if res.Error != nil {
		return res.Error
	}
	return nil
}
func (a *AssignmentRepository) Delete(assignmentId, classroomId string) error {
	res := a.Db.Where("id = ? AND classroom_id = ? ", assignmentId, classroomId).Delete(&model.Assignment{})
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

func (a *AssignmentRepository) CreateAttachments(attachments []model.AssignmentAttachment) error {
	if len(attachments) == 0 {
		return nil
	}
	return a.Db.Create(&attachments).Error
}

func (a *AssignmentRepository) DeleteAttachments(assignmentId string) error {
	return a.Db.Where("assignment_id = ?", assignmentId).Delete(&model.AssignmentAttachment{}).Error
}

func (a *AssignmentRepository) FindWaitingGrade(dosenId string) ([]data.AssignmentWaitingGradeResponse, error) {
	var result []data.AssignmentWaitingGradeResponse
	err := a.Db.Model(&model.Submission{}).
		Select(`submissions.id as submission_id, submissions.assignment_id,
			classrooms.id as classroom_id, classrooms.class_name as classroom_name,
			assignments.title as assignment_title,
			submissions.student_id as mahasiswa_id, users.fullname as mahasiswa_name,
			users.image as mahasiswa_profile, submissions.submission_date`).
		Joins("JOIN assignments ON assignments.id = submissions.assignment_id").
		Joins("JOIN classrooms ON classrooms.id = assignments.classroom_id").
		Joins("JOIN users ON users.id = submissions.student_id").
		Where("classrooms.dosen_id = ? AND submissions.status = ? AND submissions.score IS NULL", dosenId, "submitted").
		Order("submissions.submission_date DESC").
		Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (a *AssignmentRepository) IncrementViewCount(assignmentID string) error {
	return a.Db.Model(&model.Assignment{}).
		Where("id = ?", assignmentID).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

func (a *AssignmentRepository) GetViewCountBatch(assignmentIDs []string) (map[string]int64, error) {
	type viewResult struct {
		ID    string
		Count int64
	}
	var rows []viewResult
	result := a.Db.Model(&model.Assignment{}).
		Select("id, view_count as count").
		Where("id IN ?", assignmentIDs).
		Scan(&rows)
	if result.Error != nil {
		return nil, result.Error
	}
	counts := make(map[string]int64, len(assignmentIDs))
	for _, r := range rows {
		counts[r.ID] = r.Count
	}
	return counts, nil
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
