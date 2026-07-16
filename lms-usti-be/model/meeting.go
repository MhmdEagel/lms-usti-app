package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Meeting struct {
	ID          string    `gorm:"primaryKey"`
	Position    int       `gorm:"not null"`
	Topic       string    `gorm:"not null"`
	Description string `gorm:"type:text"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	ClassroomId string
	Classroom   Classroom   `gorm:"foreignKey:ClassroomId;constraint:OnDelete:CASCADE"`
	DosenId     string
	Dosen       User        `gorm:"foreignKey:DosenId;constraint:OnDelete:CASCADE"`
	Materials   []Material   `gorm:"foreignKey:MeetingId;constraint:OnDelete:CASCADE;"`
	Assignments []Assignment `gorm:"foreignKey:MeetingId;constraint:OnDelete:CASCADE;"`
}

func (m *Meeting) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	m.ID = id.String()
	return err
}
