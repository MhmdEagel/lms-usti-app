package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	CommentableTypeMaterial     = "material"
	CommentableTypeAssignment   = "assignment"
	CommentableTypeAnnouncement = "announcement"
)

type Comment struct {
	ID              string    `json:"id" gorm:"primary_key;not null"`
	Content         string    `json:"content" gorm:"not null;type:text"`
	CreatedBy       string    `json:"created_by" gorm:"not null"`
	User            User      `json:"user" gorm:"foreignKey:CreatedBy;constraint:OnDelete:CASCADE"`
	CommentableType string    `json:"commentable_type" gorm:"not null;index"`
	CommentableID   string    `json:"commentable_id" gorm:"not null;index"`
	CreatedAt       time.Time `json:"created_at"`
}

func (c *Comment) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	c.ID = id.String()
	return err
}
