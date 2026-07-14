package model

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Assignment struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Deadline    sql.NullTime `json:"deadline"`
	Instruction string    `json:"instruction" gorm:"not null"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DosenId     string    `json:"dosen_id"`
	Dosen       User      `json:"dosen" gorm:"foreignKey:DosenId;constraint:OnDelete:CASCADE"`
	ClassroomId string    `json:"classroom_id"`
	Classroom   Classroom `gorm:"foreignKey:ClassroomId;constraint:OnDelete:CASCADE"`
	MeetingId   *string   `json:"meeting_id"`
	Meeting     *Meeting  `gorm:"foreignKey:MeetingId;constraint:OnDelete:CASCADE;"`
	Attachments []AssignmentAttachment `json:"attachments" gorm:"foreignKey:AssignmentId;constraint:OnDelete:CASCADE;"`
	Submissions []Submission           `json:"submissions" gorm:"foreignKey:AssignmentId;constraint:OnDelete:CASCADE;"`
}

func (assignment *Assignment) BeforeCreate(tx *gorm.DB) error {
	assignmentId, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	assignment.ID = assignmentId.String()
	return nil
}

type AssignmentAttachment struct {
	ID           string         `gorm:"primaryKey"`
	Name         string         `gorm:"not null"`
	Type         AttachmentType `gorm:"not null"`
	Url          string         `gorm:"not null"`
	UniqueName   string
	AssignmentId string
	Assignment   Assignment `gorm:"foreignKey:AssignmentId;constraint:OnDelete:CASCADE;"`
}

func (attachment *AssignmentAttachment) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	attachment.ID = id.String()
	return err
}
