package data

type CreateConversationRequest struct {
	Name           string   `json:"name"`
	ParticipantIDs []string `json:"participant_ids" binding:"required,min=1"`
}

type SendMessageRequest struct {
	Content string `json:"content" binding:"required"`
}

type UserResponse struct {
	ID       string `json:"id"`
	Fullname string `json:"fullname"`
	Email    string `json:"email"`
	Profile  string `json:"profile"`
	Role     string `json:"role"`
}

type ParticipantResponse struct {
	ID       string       `json:"id"`
	UserID   string       `json:"user_id"`
	User     UserResponse `json:"user"`
	JoinedAt string       `json:"joined_at"`
}

type ReadByResponse struct {
	UserID   string `json:"user_id"`
	Fullname string `json:"fullname"`
	ReadAt   string `json:"read_at"`
}

type MessageResponse struct {
	ID             string           `json:"id"`
	ConversationID string           `json:"conversation_id"`
	SenderID       string           `json:"sender_id"`
	Sender         UserResponse     `json:"sender"`
	Type           string           `json:"type"`
	Content        string           `json:"content"`
	CreatedAt      string           `json:"created_at"`
	ReadBy         []ReadByResponse `json:"read_by"`
}

type ConversationResponse struct {
	ID           string                `json:"id"`
	Name         string                `json:"name"`
	Type         string                `json:"type"`
	Participants []ParticipantResponse `json:"participants"`
	LastMessage  *MessageResponse      `json:"last_message"`
	UnreadCount  int64                 `json:"unread_count"`
	LastMessageAt *string              `json:"last_message_at"`
	UpdatedAt    string                `json:"updated_at"`
	CreatedAt    string                `json:"created_at"`
}
