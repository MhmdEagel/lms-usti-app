package websocket

type MessageIn struct {
	Type           string `json:"type"`
	Token          string `json:"token"`
	ConversationID string `json:"conversation_id"`
	Content        string `json:"content"`
	MessageID      string `json:"message_id"`
}
