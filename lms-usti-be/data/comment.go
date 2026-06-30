package data

import "time"

type CommentRequest struct {
	Content string `json:"content" binding:"required"`
}

type CommentResponse struct {
	ID        string               `json:"id"`
	Content   string               `json:"content"`
	CreatedBy string               `json:"created_by"`
	User      CommentUserResponse  `json:"user"`
	CreatedAt time.Time            `json:"created_at"`
}

type CommentUserResponse struct {
	Fullname string `json:"fullname"`
	Profile  string `json:"profile"`
}
