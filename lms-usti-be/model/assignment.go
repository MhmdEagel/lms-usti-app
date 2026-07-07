package model

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Assignment struct {
	ID          string `gorm:"not null"`
	Title       string `gorm:"not null"`
	Deadline    sql.NullTime
	Instruction string `gorm:"not null"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DosenId     string
	Dosen       User      `gorm:"foreignKey:DosenId;constraint:OnDelete:CASCADE"`
	ClassroomId string
	ViewCount   int64 `json:"view_count" gorm:"default:0"`
	Attachments []AssignmentAttachment `gorm:"foreignKey:AssignmentId;constraint:OnDelete:CASCADE;"`
	Submissions []Submission           `gorm:"foreignKey:AssignmentId;constraint:OnDelete:CASCADE;"`
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
