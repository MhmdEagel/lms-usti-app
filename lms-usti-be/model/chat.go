package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Conversation struct {
	ID            string                    `json:"id" gorm:"primary_key;not null"`
	Name          string                    `json:"name" gorm:"default:''"`
	Type          string                    `json:"type" gorm:"type:varchar(10);default:'direct'"`
	LastMessageAt *time.Time                `json:"last_message_at"`
	CreatedAt     time.Time                 `json:"created_at"`
	UpdatedAt     time.Time                 `json:"updated_at"`
	Participants  []ConversationParticipant `json:"participants" gorm:"foreignKey:ConversationID;constraint:OnDelete:CASCADE"`
	Messages      []Message                 `json:"messages" gorm:"foreignKey:ConversationID;constraint:OnDelete:CASCADE"`
}

func (c *Conversation) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	c.ID = id.String()
	return err
}

type ConversationParticipant struct {
	ID             string       `json:"id" gorm:"primary_key;not null"`
	ConversationID string       `json:"conversation_id" gorm:"not null;uniqueIndex:idx_conv_user"`
	UserID         string       `json:"user_id" gorm:"not null;uniqueIndex:idx_conv_user;index"`
	User           User         `json:"user" gorm:"foreignKey:UserID"`
	Conversation   Conversation `json:"-" gorm:"foreignKey:ConversationID;constraint:OnDelete:CASCADE"`
	JoinedAt       time.Time    `json:"joined_at"`
}

func (cp *ConversationParticipant) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	cp.ID = id.String()
	return err
}

type Message struct {
	ID             string        `json:"id" gorm:"primary_key;not null"`
	ConversationID string        `json:"conversation_id" gorm:"not null;index"`
	SenderID       string        `json:"sender_id" gorm:"not null;index"`
	Sender         User          `json:"sender" gorm:"foreignKey:SenderID"`
	Conversation   Conversation  `json:"-" gorm:"foreignKey:ConversationID;constraint:OnDelete:CASCADE"`
	Type           string        `json:"type" gorm:"type:varchar(10);default:'text'"`
	Content        string        `json:"content" gorm:"not null;type:text"`
	CreatedAt      time.Time     `json:"created_at"`
	DeletedAt      gorm.DeletedAt `json:"deleted_at"`
	ReadBy         []MessageReadBy `json:"read_by" gorm:"foreignKey:MessageID;constraint:OnDelete:CASCADE"`
}

func (m *Message) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	m.ID = id.String()
	return err
}

type MessageReadBy struct {
	ID        string    `json:"id" gorm:"primary_key;not null"`
	MessageID string    `json:"message_id" gorm:"not null;uniqueIndex:idx_msg_user"`
	UserID    string    `json:"user_id" gorm:"not null;uniqueIndex:idx_msg_user;index"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Message   Message   `json:"-" gorm:"foreignKey:MessageID;constraint:OnDelete:CASCADE"`
	ReadAt    time.Time `json:"read_at"`
}

func (mrb *MessageReadBy) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	mrb.ID = id.String()
	return err
}
