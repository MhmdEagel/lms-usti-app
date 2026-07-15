package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type MeetingRepository struct {
	Db *gorm.DB
}

type MeetingRepositoryInterface interface {
	Create(meeting *model.Meeting) error
	FindAll(classroomId string) ([]model.Meeting, error)
	FindById(meetingId string) (model.Meeting, error)
	Update(meeting model.Meeting) error
	Delete(meetingId, classroomId string) error
	CountByClassroom(classroomId string) (int64, error)
	Reorder(meetingIDs []string) error
	Transaction(fn func(repo MeetingRepositoryInterface) error) error
}

func NewMeetingRepository(Db *gorm.DB) MeetingRepositoryInterface {
	return &MeetingRepository{Db: Db}
}

func (m *MeetingRepository) Create(meeting *model.Meeting) error {
	return m.Db.Create(meeting).Error
}

func (m *MeetingRepository) FindAll(classroomId string) ([]model.Meeting, error) {
	var meetings []model.Meeting
	err := m.Db.Where("classroom_id = ?", classroomId).
		Preload("Materials", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, title, created_at, classroom_id, dosen_id, meeting_id")
		}).
		Preload("Assignments", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, title, deadline, created_at, classroom_id, dosen_id, meeting_id")
		}).
		Order("position ASC").
		Find(&meetings).Error
	return meetings, err
}

func (m *MeetingRepository) FindById(meetingId string) (model.Meeting, error) {
	var meeting model.Meeting
	err := m.Db.Where("id = ?", meetingId).First(&meeting).Error
	return meeting, err
}

func (m *MeetingRepository) Update(meeting model.Meeting) error {
	return m.Db.Where("id = ?", meeting.ID).Model(&model.Meeting{}).Updates(meeting).Error
}

func (m *MeetingRepository) Delete(meetingId, classroomId string) error {
	res := m.Db.Where("id = ? AND classroom_id = ?", meetingId, classroomId).Delete(&model.Meeting{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (m *MeetingRepository) CountByClassroom(classroomId string) (int64, error) {
	var count int64
	err := m.Db.Model(&model.Meeting{}).Where("classroom_id = ?", classroomId).Count(&count).Error
	return count, err
}

func (m *MeetingRepository) Reorder(meetingIDs []string) error {
	return m.Db.Transaction(func(tx *gorm.DB) error {
		for i, id := range meetingIDs {
			res := tx.Model(&model.Meeting{}).Where("id = ?", id).Update("position", i+1)
			if res.Error != nil {
				return res.Error
			}
			if res.RowsAffected == 0 {
				return gorm.ErrRecordNotFound
			}
		}
		return nil
	})
}

func (m *MeetingRepository) withTx(tx *gorm.DB) MeetingRepositoryInterface {
	return &MeetingRepository{Db: tx}
}

func (m *MeetingRepository) Transaction(fn func(repo MeetingRepositoryInterface) error) error {
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
