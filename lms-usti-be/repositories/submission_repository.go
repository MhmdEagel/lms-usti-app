package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type SubmissionRepository struct {
	Db *gorm.DB
}

type SubmissionRepositoryInterface interface {
	Create(submission []model.Submission) error
	CreateAttachments(attachments []model.SubmissionAttachment) error
	FindAllByAssignmentId(classroomId string, assignmentId string, search string, filter string, pagination data.Pagination) (result *data.PaginationWithData, err error)
	FindById(submissionId string) (submission model.Submission, err error)
	DeleteAttachments(attachments []model.SubmissionAttachment) error
	FindByAssignmentId(assignmentId string) (submission model.Submission, err error)
	FindByAssignmentIdAndStudentId(assignmentId, studentId string) (submission model.Submission, err error)
	Update(submission model.Submission) error
	Delete(submissionId string) error
	GetSubmissionStats(assignmentId string) (totalStudents, totalSubmitted, totalGraded int64, err error)
	GetSubmissionStatsBatch(assignmentIds []string) (map[string]data.SubmissionStatsResponse, error)
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
func (s *SubmissionRepository) FindAllByAssignmentId(classroomId string, assignmentId string, search string, filter string, pagination data.Pagination) (result *data.PaginationWithData, err error) {
	result = &data.PaginationWithData{Pagination: pagination}

	if filter == "belum_mengirim" {
		var submissions []model.Submission
		query := s.Db.Preload("User").Where("submissions.assignment_id = ? AND submissions.status = ?", assignmentId, "not_submitted")
		if search != "" {
			query = query.Where("submissions.student_id IN (?)",
				s.Db.Model(&model.User{}).Select("id").Where("fullname LIKE ?", "%"+search+"%"),
			)
		}
		if err := query.Scopes(lib.Paginate(submissions, &pagination, query)).Find(&submissions).Error; err != nil {
			return nil, err
		}
		result.Data = submissions
		result.Pagination = pagination
		return result, nil
	}

	var submissions []model.Submission
	query := s.Db.Preload("User").Where("submissions.assignment_id = ?", assignmentId)
	if search != "" {
		query = query.Where("submissions.student_id IN (?)",
			s.Db.Model(&model.User{}).Select("id").Where("fullname LIKE ?", "%"+search+"%"),
		)
	}
	if filter == "sudah_mengirim" {
		query = query.Where("submissions.status = ?", "submitted")
	} else if filter == "belum_dinilai" {
		query = query.Where("submissions.status = ? AND submissions.score IS NULL", "submitted")
	} else if filter == "telat" {
		query = query.Joins("JOIN assignments ON assignments.id = submissions.assignment_id").
			Where("submissions.submission_date IS NOT NULL AND submissions.submission_date > assignments.deadline")
	}
	if err := query.Scopes(lib.Paginate(submissions, &pagination, query)).Find(&submissions).Error; err != nil {
		return nil, err
	}
	result.Data = submissions
	result.Pagination = pagination
	return result, nil
}
func (s *SubmissionRepository) CreateAttachments(attachments []model.SubmissionAttachment) error {
	result := s.Db.Create(&attachments)
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
	result := s.Db.Where("id = ?", submissionId).Preload("User").Preload("Attachments").First(&submission)
	if result.Error != nil {
		return model.Submission{}, result.Error
	}
	return submission, nil
}
func (s *SubmissionRepository) FindByAssignmentId(assignmentId string) (submission model.Submission, err error) {
	result := s.Db.Preload("Attachments").Where("assignment_id = ?", assignmentId).First(&submission)
	if result.Error != nil {
		return model.Submission{}, result.Error
	}
	return submission, nil
}
func (s *SubmissionRepository) FindByAssignmentIdAndStudentId(assignmentId, studentId string) (submission model.Submission, err error) {
	result := s.Db.Preload("Attachments").Where("assignment_id = ? AND student_id = ?", assignmentId, studentId).First(&submission)
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

func (s *SubmissionRepository) GetSubmissionStatsBatch(assignmentIds []string) (map[string]data.SubmissionStatsResponse, error) {
	if len(assignmentIds) == 0 {
		return map[string]data.SubmissionStatsResponse{}, nil
	}
	type statsRow struct {
		AssignmentID   string `gorm:"column:assignment_id"`
		TotalStudents  int64  `gorm:"column:total_students"`
		TotalSubmitted int64  `gorm:"column:total_submitted"`
		TotalGraded    int64  `gorm:"column:total_graded"`
	}
	var rows []statsRow
	if err := s.Db.Model(&model.Submission{}).
		Select("assignment_id, COUNT(*) as total_students, COUNT(CASE WHEN status = 'submitted' THEN 1 END) as total_submitted, COUNT(CASE WHEN score IS NOT NULL THEN 1 END) as total_graded").
		Where("assignment_id IN ?", assignmentIds).
		Group("assignment_id").
		Scan(&rows).Error; err != nil {
		return nil, err
	}
	result := make(map[string]data.SubmissionStatsResponse, len(rows))
	for _, row := range rows {
		result[row.AssignmentID] = data.SubmissionStatsResponse{
			TotalStudents:  row.TotalStudents,
			TotalSubmitted: row.TotalSubmitted,
			TotalGraded:    row.TotalGraded,
		}
	}
	for _, id := range assignmentIds {
		if _, ok := result[id]; !ok {
			result[id] = data.SubmissionStatsResponse{}
		}
	}
	return result, nil
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
func (s *SubmissionRepository) DeleteAttachments(attachments []model.SubmissionAttachment) error {
	res := s.Db.Delete(&attachments)
	if res.Error != nil {
		return res.Error
	}
	return nil
}
