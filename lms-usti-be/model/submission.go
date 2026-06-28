package model

import (
	"database/sql"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Submission struct {
	ID              string           `gorm:"primaryKey"`
	Status          string           `gorm:"not null"`
	Score           *float64
	SubmissionDate  sql.NullTime
	StudentId       string           `gorm:"not null"`
	AssignmentId    string           `gorm:"not null"`
	Assignment      Assignment       `gorm:"foreignKey:AssignmentId;constraint:OnDelete:CASCADE;"`
	User            User             `gorm:"foreignKey:StudentId"`
	SubmissionFiles []SubmissionFile `gorm:"foreignKey:SubmissionId;constraint:OnDelete:CASCADE;"`
	SubmissionLinks []SubmissionLink `gorm:"foreignKey:SubmissionId;constraint:OnDelete:CASCADE;"`
}
type SubmissionFile struct {
	ID           string `gorm:"primaryKey"`
	FileName     string `gorm:"not null"`
	FileUrl      string `gorm:"not null"`
	SubmissionId string
}
type SubmissionLink struct {
	ID           string `gorm:"primaryKey"`
	LinkName     string `gorm:"not null"`
	LinkUrl      string `gorm:"not null"`
	SubmissionId string
}

func (submission *Submission) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	submission.ID = id.String()
	return err
}
func (submissionFile *SubmissionFile) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	submissionFile.ID = id.String()
	return err
}
func (submissionLink *SubmissionLink) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	submissionLink.ID = id.String()
	return err
}
