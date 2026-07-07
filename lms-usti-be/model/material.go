package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AttachmentType string

const (
	AttachmentTypeFile AttachmentType = "FILE"
	AttachmentTypeLink AttachmentType = "LINK"
)

type Material struct {
	ID          string `gorm:"primaryKey"`
	Title       string `gorm:"not null"`
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DosenId     string
	Dosen       User      `gorm:"foreignKey:DosenId;constraint:OnDelete:CASCADE"`
	ClassroomId string
	ViewCount   int64 `json:"view_count" gorm:"default:0"`
	Attachments []MaterialAttachment `gorm:"foreignKey:MaterialId;constraint:OnDelete:CASCADE;"`
}

func (material *Material) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	material.ID = id.String()
	return err
}

type MaterialAttachment struct {
	ID          string         `gorm:"primaryKey"`
	Name        string         `gorm:"not null"`
	Type        AttachmentType `gorm:"not null"`
	Url         string         `gorm:"not null"`
	UniqueName  string
	MaterialId  string
	Material    Material `gorm:"foreignKey:MaterialId"`
}

func (attachment *MaterialAttachment) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	attachment.ID = id.String()
	return err
}
