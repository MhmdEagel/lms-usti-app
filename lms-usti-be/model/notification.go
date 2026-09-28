package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	NotificationTypeAssignmentCreated  = "ASSIGNMENT_CREATED"
	NotificationTypeSubmissionGraded   = "SUBMISSION_GRADED"
	NotificationTypeForumPostCreated   = "FORUM_POST_CREATED"
	NotificationTypeClassroomBroadcast = "CLASSROOM_BROADCAST"
)

type Notification struct {
	ID           string    `json:"id" gorm:"primary_key;not null"`
	UserId       string    `json:"user_id" gorm:"not null;index"`
	Type         string    `json:"type" gorm:"type:varchar(40);not null"`
	Title        string    `json:"title" gorm:"not null"`
	Body         string    `json:"body" gorm:"type:text"`
	ClassroomId  string    `json:"classroom_id" gorm:"index"`
	AssignmentId string    `json:"assignment_id"`
	ForumPostId  string    `json:"forum_post_id"`
	IsRead       bool      `json:"is_read" gorm:"default:false;index"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (notification *Notification) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	notification.ID = id.String()
	return err
}
