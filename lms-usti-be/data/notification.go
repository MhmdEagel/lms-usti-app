package data

import "time"

type NotificationResponse struct {
	ID             string    `json:"id"`
	Type           string    `json:"type"`
	Title          string    `json:"title"`
	Body           string    `json:"body"`
	ClassroomId    string    `json:"classroom_id"`
	ConversationId string    `json:"conversation_id"`
	AssignmentId   string    `json:"assignment_id"`
	ForumPostId    string    `json:"forum_post_id"`
	IsRead         bool      `json:"is_read"`
	CreatedAt      time.Time `json:"created_at"`
}

type NotificationUnreadCountResponse struct {
	UnreadCount int64 `json:"unread_count"`
}
