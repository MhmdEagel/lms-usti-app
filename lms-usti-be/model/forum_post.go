package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ForumPost struct {
	ID        string    `json:"id" gorm:"primary_key;not null"`
	Title     string    `json:"title" gorm:"not null"`
	Content   string    `json:"content" gorm:"type:text"`
	CreatedBy string    `json:"created_by" gorm:"not null"`
	Author    User      `json:"author" gorm:"foreignKey:CreatedBy;constraint:OnDelete:CASCADE"`
	IsPinned  bool      `json:"is_pinned" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (fp *ForumPost) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	fp.ID = id.String()
	fp.IsPinned = false
	return err
}
