package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ClassroomForumPost struct {
	ID          string `json:"id" gorm:"primary_key;not null"`
	Title       string `json:"title" gorm:"not null;"`
	Content     string `json:"content" gorm:"not null;type:text"`
	IsPinned    bool   `json:"is_pinned" gorm:"default:false"`
	CreatedAt   time.Time
	ClassroomId string
	DosenId     string
	Dosen     User      `json:"dosen" gorm:"foreignKey:DosenId;constraint:OnDelete:CASCADE"`
	Classroom Classroom `gorm:"foreignKey:ClassroomId;constraint:OnDelete:CASCADE"`
}

func (classroomForumPost *ClassroomForumPost) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	classroomForumPost.ID = id.String()
	classroomForumPost.IsPinned = false
	return err
}
