package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type MessageRepository struct {
	Db *gorm.DB
}

type MessageRepositoryInterface interface {
	FindByConversationID(conversationID string, limit, offset int) ([]model.Message, error)
	FindByCursor(conversationID string, cursor string, limit int) ([]model.Message, error)
	FindByID(messageID string) (model.Message, error)
	Create(message *model.Message) error
	GetLastMessage(conversationID string) (model.Message, error)
	CountUnread(conversationID, userID string) (int64, error)
	CreateReadReceipt(messageID, userID string) error
	HasReadReceipt(messageID, userID string) (bool, error)
	GetLastMessagesByConversationIDs(conversationIDs []string) (map[string]model.Message, error)
	CountUnreadBatch(conversationIDs []string, userID string) (map[string]int64, error)
	GetReadByUserIDs(messageID string) ([]model.MessageReadBy, error)
}

func NewMessageRepository(Db *gorm.DB) MessageRepositoryInterface {
	return &MessageRepository{Db: Db}
}

func (r *MessageRepository) FindByConversationID(conversationID string, limit, offset int) ([]model.Message, error) {
	var messages []model.Message
	err := r.Db.
		Preload("Sender").
		Preload("ReadBy.User").
		Where("conversation_id = ? AND messages.deleted_at IS NULL", conversationID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error
	return messages, err
}

func (r *MessageRepository) FindByCursor(conversationID string, cursor string, limit int) ([]model.Message, error) {
	var messages []model.Message
	query := r.Db.
		Preload("Sender").
		Preload("ReadBy.User").
		Where("conversation_id = ? AND messages.deleted_at IS NULL", conversationID)

	if cursor != "" {
		query = query.Where("messages.created_at < ?", cursor)
	}

	err := query.
		Order("created_at DESC").
		Limit(limit).
		Find(&messages).Error
	return messages, err
}

func (r *MessageRepository) FindByID(messageID string) (model.Message, error) {
	var message model.Message
	err := r.Db.
		Preload("Sender").
		Preload("ReadBy.User").
		Where("id = ? AND messages.deleted_at IS NULL", messageID).
		First(&message).Error
	return message, err
}

func (r *MessageRepository) Create(message *model.Message) error {
	return r.Db.Create(message).Error
}

func (r *MessageRepository) GetLastMessage(conversationID string) (model.Message, error) {
	var message model.Message
	err := r.Db.
		Preload("Sender").
		Where("conversation_id = ? AND messages.deleted_at IS NULL", conversationID).
		Order("created_at DESC").
		First(&message).Error
	return message, err
}

func (r *MessageRepository) CountUnread(conversationID, userID string) (int64, error) {
	var readCount int64
	r.Db.Model(&model.MessageReadBy{}).
		Joins("JOIN messages ON messages.id = message_read_bies.message_id").
		Where("messages.conversation_id = ? AND message_read_bies.user_id = ? AND messages.deleted_at IS NULL", conversationID, userID).
		Count(&readCount)

	var totalCount int64
	r.Db.Model(&model.Message{}).
		Where("conversation_id = ? AND sender_id != ? AND deleted_at IS NULL", conversationID, userID).
		Count(&totalCount)

	unread := totalCount - readCount
	if unread < 0 {
		unread = 0
	}
	return unread, nil
}

func (r *MessageRepository) CreateReadReceipt(messageID, userID string) error {
	return r.Db.Where("message_id = ? AND user_id = ?", messageID, userID).
		FirstOrCreate(&model.MessageReadBy{
			MessageID: messageID,
			UserID:    userID,
		}).Error
}

func (r *MessageRepository) HasReadReceipt(messageID, userID string) (bool, error) {
	var count int64
	err := r.Db.Model(&model.MessageReadBy{}).
		Where("message_id = ? AND user_id = ?", messageID, userID).
		Count(&count).Error
	return count > 0, err
}

func (r *MessageRepository) GetLastMessagesByConversationIDs(conversationIDs []string) (map[string]model.Message, error) {
	if len(conversationIDs) == 0 {
		return map[string]model.Message{}, nil
	}

	var messages []model.Message
	err := r.Db.
		Preload("Sender").
		Where("conversation_id IN ? AND messages.deleted_at IS NULL", conversationIDs).
		Order("created_at DESC").
		Limit(len(conversationIDs)).
		Find(&messages).Error
	if err != nil {
		return nil, err
	}

	result := make(map[string]model.Message, len(conversationIDs))
	for _, msg := range messages {
		if _, exists := result[msg.ConversationID]; !exists {
			result[msg.ConversationID] = msg
		}
	}
	return result, nil
}

func (r *MessageRepository) CountUnreadBatch(conversationIDs []string, userID string) (map[string]int64, error) {
	if len(conversationIDs) == 0 {
		return map[string]int64{}, nil
	}

	type countResult struct {
		ConversationID string
		TotalCount     int64
		ReadCount      int64
	}

	var results []countResult
	err := r.Db.Raw(`
		SELECT
			m.conversation_id,
			COUNT(*) AS total_count,
			COUNT(r.message_id) AS read_count
		FROM messages m
		LEFT JOIN message_read_bies r ON r.message_id = m.id AND r.user_id = ?
		WHERE m.conversation_id IN ? AND m.sender_id != ? AND m.deleted_at IS NULL
		GROUP BY m.conversation_id
	`, userID, conversationIDs, userID).Scan(&results).Error
	if err != nil {
		return nil, err
	}

	result := make(map[string]int64, len(conversationIDs))
	for _, convID := range conversationIDs {
		result[convID] = 0
	}
	for _, cr := range results {
		unread := cr.TotalCount - cr.ReadCount
		if unread < 0 {
			unread = 0
		}
		result[cr.ConversationID] = unread
	}
	return result, nil
}

func (r *MessageRepository) GetReadByUserIDs(messageID string) ([]model.MessageReadBy, error) {
	var receipts []model.MessageReadBy
	err := r.Db.
		Preload("User").
		Where("message_id = ?", messageID).
		Find(&receipts).Error
	return receipts, err
}
