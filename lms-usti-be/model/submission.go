package model

import (
	"database/sql"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Submission struct {
	ID             string                `gorm:"primaryKey"`
	Status         string                `gorm:"not null"`
	Score          *float64
	SubmissionDate sql.NullTime
	StudentId      string                `gorm:"not null"`
	AssignmentId   string                `gorm:"not null"`
	Assignment     Assignment            `gorm:"foreignKey:AssignmentId;constraint:OnDelete:CASCADE;"`
	User           User                  `gorm:"foreignKey:StudentId"`
	Attachments    []SubmissionAttachment `gorm:"foreignKey:SubmissionId;constraint:OnDelete:CASCADE;"`
}

type SubmissionAttachment struct {
	ID           string         `gorm:"primaryKey"`
	Name         string         `gorm:"not null"`
	Type         AttachmentType `gorm:"not null"`
	Url          string         `gorm:"not null"`
	SubmissionId string
	Submission   Submission `gorm:"foreignKey:SubmissionId"`
}

func (submission *Submission) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	submission.ID = id.String()
	return err
}
func (attachment *SubmissionAttachment) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	attachment.ID = id.String()
	return err
}
