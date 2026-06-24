package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type SubmissionRepository struct {
	Db *gorm.DB
}

type SubmissionRepositoryInterface interface {
	Create(submission []model.Submission) error
	CreateSubmissionFiles(submissionFiles []model.SubmissionFile) error
	FindAllByAssignmentId(assignmentId string) (submissions []model.Submission, err error)
	FindById(submissionId string) (submission model.Submission, err error)
	CreateSubmissionLinks(submissionLinks []model.SubmissionLink) error
	FindByAssignmentId(assignmentId string) (submission model.Submission, err error)
	FindByAssignmentIdAndStudentId(assignmentId, studentId string) (submission model.Submission, err error)
	Update(submission model.Submission) error
	Delete(submissionId string) error
	DeleteFiles(submissionFiles []model.SubmissionFile) error
	DeleteLinks(submissionLinks []model.SubmissionLink) error
	GetSubmissionStats(assignmentId string) (totalStudents, totalSubmitted, totalGraded int64, err error)
	IsAlreadyCreated(studentId string, classroomId string) bool
}

func NewSubmissionRepository(Db *gorm.DB) SubmissionRepositoryInterface {
	return &SubmissionRepository{Db: Db}
}
func (s *SubmissionRepository) Create(submission []model.Submission) error {
	result := s.Db.Create(submission)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
func (s *SubmissionRepository) FindAllByAssignmentId(assignmentId string) (submissions []model.Submission, err error) {
	s.Db.Preload("User").Preload("SubmissionFiles").Preload("SubmissionLinks").Where("assignment_id = ?", assignmentId).Find(&submissions)
	return submissions, nil
}
func (s *SubmissionRepository) CreateSubmissionFiles(submissionFiles []model.SubmissionFile) error {
	result := s.Db.Create(&submissionFiles)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
func (s *SubmissionRepository) CreateSubmissionLinks(submissionLinks []model.SubmissionLink) error {
	result := s.Db.Create(&submissionLinks)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
func (s *SubmissionRepository) Update(submission model.Submission) error {
	res := s.Db.Where("id = ?", submission.ID).Updates(submission)
	if res.Error != nil {
		return res.Error
	}
	return nil
}
func (s *SubmissionRepository) FindById(submissionId string) (submission model.Submission, err error) {
	result := s.Db.Where("id = ?", submissionId).Preload("User").Preload("SubmissionFiles").Preload("SubmissionLinks").First(&submission)
	if result.Error != nil {
		return model.Submission{}, result.Error
	}
	return submission, nil
}
func (s *SubmissionRepository) FindByAssignmentId(assignmentId string) (submission model.Submission, err error) {
	result := s.Db.Preload("SubmissionFiles").Preload("SubmissionLinks").Where("assignment_id = ?", assignmentId).First(&submission)
	if result.Error != nil {
		return model.Submission{}, result.Error
	}
	return submission, nil
}
func (s *SubmissionRepository) FindByAssignmentIdAndStudentId(assignmentId, studentId string) (submission model.Submission, err error) {
	result := s.Db.Preload("SubmissionFiles").Preload("SubmissionLinks").Where("assignment_id = ? AND student_id = ?", assignmentId, studentId).First(&submission)
	if result.Error != nil {
		return model.Submission{}, result.Error
	}
	return submission, nil
}
func (s *SubmissionRepository) GetSubmissionStats(assignmentId string) (totalStudents, totalSubmitted, totalGraded int64, err error) {
	if err := s.Db.Model(&model.Submission{}).Where("assignment_id = ?", assignmentId).Count(&totalStudents).Error; err != nil {
		return 0, 0, 0, err
	}
	if err := s.Db.Model(&model.Submission{}).Where("assignment_id = ? AND status = ?", assignmentId, "submitted").Count(&totalSubmitted).Error; err != nil {
		return 0, 0, 0, err
	}
	if err := s.Db.Model(&model.Submission{}).Where("assignment_id = ? AND score IS NOT NULL", assignmentId).Count(&totalGraded).Error; err != nil {
		return 0, 0, 0, err
	}
	return totalStudents, totalSubmitted, totalGraded, nil
}

func (s *SubmissionRepository) IsAlreadyCreated(studentId string, classroomId string) bool {
	var count int64
	s.Db.Model(&model.Submission{}).
		Joins("JOIN assignments ON assignments.id = submissions.assignment_id").
		Where("submissions.student_id = ? AND assignments.classroom_id = ?", studentId, classroomId).
		Count(&count)
	return count > 0
}
func (s *SubmissionRepository) Delete(submissionId string) error {
	res := s.Db.Where("id = ? ", submissionId).Delete(model.Submission{})
	if res.Error != nil {
		return res.Error
	}
	return nil
}
func (s *SubmissionRepository) DeleteFiles(submissionFiles []model.SubmissionFile) error {
	res := s.Db.Delete(&submissionFiles)
	if res.Error != nil {
		return res.Error
	}
	return nil
}
func (s *SubmissionRepository) DeleteLinks(submissionLinks []model.SubmissionLink) error {
	res := s.Db.Delete(&submissionLinks)
	if res.Error != nil {
		return res.Error
	}
	return nil
}
