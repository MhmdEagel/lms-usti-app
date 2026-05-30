package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Assignment struct {
	ID          string    `gorm:"not null"`
	Title       string    `gorm:"not null"`
	Deadline    time.Time 
	Instruction string    `gorm:"not null"`
	ClassroomId string
	Rubrics     []AssignmentRubric `gorm:"constraint:OnDelete:CASCADE;"`
}

type AssignmentRubric struct {
	ID           string `gorm:"not null"`
	Name         string
	Score        int
	AssignmentId string
	Assignment   Assignment `gorm:"foreignKey:AssignmentId"`
}

func (assignment *Assignment) BeforeCreate(tx *gorm.DB) error {
	assignmentId, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	assignment.ID = assignmentId.String()
	return nil
}

func (assignmentRubric *AssignmentRubric) BeforeCreate(tx *gorm.DB) error {
	assignmentRubricId, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	assignmentRubric.ID = assignmentRubricId.String()
	return nil
}
