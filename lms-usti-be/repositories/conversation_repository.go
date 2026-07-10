package repositories

import (
	"time"

	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type ConversationRepository struct {
	Db *gorm.DB
}

type ConversationRepositoryInterface interface {
	FindAllByUserID(userID string) ([]model.Conversation, error)
	FindByID(conversationID string) (model.Conversation, error)
	Create(conversation *model.Conversation) error
	AddParticipant(participant *model.ConversationParticipant) error
	FindParticipant(conversationID, userID string) (model.ConversationParticipant, error)
	FindExistingConversation(userID1, userID2 string) (model.Conversation, error)
	FindParticipantsByConversationID(conversationID string) ([]model.ConversationParticipant, error)
	UpdateLastMessageAt(conversationID string, t time.Time) error
}

func NewConversationRepository(Db *gorm.DB) ConversationRepositoryInterface {
	return &ConversationRepository{Db: Db}
}

func (r *ConversationRepository) FindAllByUserID(userID string) ([]model.Conversation, error) {
	var conversations []model.Conversation
	err := r.Db.
		Preload("Participants.User").
		Joins("JOIN conversation_participants ON conversation_participants.conversation_id = conversations.id").
		Where("conversation_participants.user_id = ?", userID).
		Order("conversations.updated_at DESC").
		Find(&conversations).Error
	return conversations, err
}

func (r *ConversationRepository) FindByID(conversationID string) (model.Conversation, error) {
	var conversation model.Conversation
	err := r.Db.
		Preload("Participants.User").
		Where("id = ?", conversationID).
		First(&conversation).Error
	return conversation, err
}

func (r *ConversationRepository) Create(conversation *model.Conversation) error {
	return r.Db.Create(conversation).Error
}

func (r *ConversationRepository) AddParticipant(participant *model.ConversationParticipant) error {
	return r.Db.Create(participant).Error
}

func (r *ConversationRepository) FindParticipant(conversationID, userID string) (model.ConversationParticipant, error) {
	var participant model.ConversationParticipant
	err := r.Db.
		Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		First(&participant).Error
	return participant, err
}

func (r *ConversationRepository) FindExistingConversation(userID1, userID2 string) (model.Conversation, error) {
	var conversation model.Conversation
	err := r.Db.
		Joins("JOIN conversation_participants cp1 ON cp1.conversation_id = conversations.id").
		Joins("JOIN conversation_participants cp2 ON cp2.conversation_id = conversations.id").
		Where("cp1.user_id = ? AND cp2.user_id = ? AND conversations.type = 'direct'", userID1, userID2).
		Preload("Participants.User").
		First(&conversation).Error
	return conversation, err
}

func (r *ConversationRepository) UpdateLastMessageAt(conversationID string, t time.Time) error {
	return r.Db.Model(&model.Conversation{}).
		Where("id = ?", conversationID).
		Updates(map[string]any{
			"last_message_at": t,
			"updated_at":      t,
		}).Error
}

func (r *ConversationRepository) FindParticipantsByConversationID(conversationID string) ([]model.ConversationParticipant, error) {
	var participants []model.ConversationParticipant
	err := r.Db.
		Preload("User").
		Where("conversation_id = ?", conversationID).
		Find(&participants).Error
	return participants, err
}
