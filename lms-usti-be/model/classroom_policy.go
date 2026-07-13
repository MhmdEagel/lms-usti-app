package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	LateSubmissionAllow     = "allow"
	LateSubmissionNotAllow  = "not_allowed"
	ForumPermissionFull     = "full_access"
	ForumPermissionComment  = "comment_only"
	ForumPermissionDosen    = "dosen_only"
	CommentPermissionActive   = "active"
	CommentPermissionInactive = "inactive"
)

type ClassroomPolicy struct {
	ID                string    `json:"id" gorm:"primary_key;not null"`
	ClassroomID       string    `json:"classroom_id" gorm:"not null;uniqueIndex;constraint:OnDelete:CASCADE"`
	LateSubmission    string    `json:"late_submission" gorm:"type:varchar(20);default:allow"`
	ForumPermission   string    `json:"forum_permission" gorm:"type:varchar(20);default:comment_only"`
	CommentPermission string    `json:"comment_permission" gorm:"type:varchar(20);default:active"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func (cp *ClassroomPolicy) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	cp.ID = id.String()
	return err
}
