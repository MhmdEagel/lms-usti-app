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
	FindByClassroomId(classroomId string) (model.Conversation, error)
	FindArchivedClassroomConversationIDs(conversationIDs []string) ([]string, error)
	AddParticipantIfAbsent(participant *model.ConversationParticipant) error
	RemoveParticipant(conversationID, userID string) error
	DeleteByClassroomId(classroomId string) error
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

func (r *ConversationRepository) FindArchivedClassroomConversationIDs(conversationIDs []string) ([]string, error) {
	if len(conversationIDs) == 0 {
		return []string{}, nil
	}

	var archivedIDs []string
	err := r.Db.Model(&model.Conversation{}).
		Select("conversations.id").
		Joins("JOIN classrooms ON classrooms.id = conversations.classroom_id").
		Where("conversations.id IN ?", conversationIDs).
		Where("classrooms.is_archived = ?", true).
		Pluck("conversations.id", &archivedIDs).Error
	if err != nil {
		return nil, err
	}
	return archivedIDs, nil
}

func (r *ConversationRepository) FindByClassroomId(classroomId string) (model.Conversation, error) {
	var conversation model.Conversation
	err := r.Db.
		Preload("Participants.User").
		Where("classroom_id = ?", classroomId).
		First(&conversation).Error
	return conversation, err
}

func (r *ConversationRepository) AddParticipantIfAbsent(participant *model.ConversationParticipant) error {
	var count int64
	err := r.Db.Model(&model.ConversationParticipant{}).
		Where("conversation_id = ? AND user_id = ?", participant.ConversationID, participant.UserID).
		Count(&count).Error
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	return r.Db.Create(participant).Error
}

func (r *ConversationRepository) RemoveParticipant(conversationID, userID string) error {
	return r.Db.
		Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Delete(&model.ConversationParticipant{}).Error
}

// DeleteByClassroomId removes the classroom group and everything attached to
// it (participants, messages — including soft-deleted ones — and read
// receipts) in a single transaction.
func (r *ConversationRepository) DeleteByClassroomId(classroomId string) error {
	if classroomId == "" {
		return nil
	}
	return r.Db.Transaction(func(tx *gorm.DB) error {
		var conversationIDs []string
		if err := tx.Model(&model.Conversation{}).
			Where("classroom_id = ?", classroomId).
			Pluck("id", &conversationIDs).Error; err != nil {
			return err
		}
		if len(conversationIDs) == 0 {
			return nil
		}

		messageQuery := tx.Model(&model.Message{}).Select("id").
			Where("conversation_id IN ?", conversationIDs)
		if err := tx.Unscoped().
			Where("message_id IN (?)", messageQuery).
			Delete(&model.MessageReadBy{}).Error; err != nil {
			return err
		}
		if err := tx.Unscoped().
			Where("conversation_id IN ?", conversationIDs).
			Delete(&model.Message{}).Error; err != nil {
			return err
		}
		if err := tx.Where("conversation_id IN ?", conversationIDs).
			Delete(&model.ConversationParticipant{}).Error; err != nil {
			return err
		}
		return tx.Unscoped().
			Where("id IN ?", conversationIDs).
			Delete(&model.Conversation{}).Error
	})
}
