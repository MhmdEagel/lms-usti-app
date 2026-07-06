package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	ViewableTypeForumPost  = "forum_post"
	ViewableTypeMaterial   = "material"
	ViewableTypeAssignment = "assignment"
)

type ContentView struct {
	ID           string    `json:"id" gorm:"primary_key;not null"`
	UserID       string    `json:"user_id" gorm:"not null;uniqueIndex:idx_unique_view"`
	ViewableType string    `json:"viewable_type" gorm:"type:varchar(50);not null;uniqueIndex:idx_unique_view"`
	ViewableID   string    `json:"viewable_id" gorm:"not null;uniqueIndex:idx_unique_view"`
	ViewedAt     time.Time `json:"viewed_at" gorm:"autoCreateTime"`
}

func (cv *ContentView) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	cv.ID = id.String()
	return err
}
