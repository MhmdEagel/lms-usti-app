package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Material struct {
	ID            string `gorm:"primaryKey"`
	Title         string `gorm:"not null"`
	Description   string
	CreatedAt     time.Time
	UpdatedAt     time.Time
	ClassroomId   string
	MaterialFiles []MaterialFile `gorm:"foreignKey:MaterialId;constraint:OnDelete:CASCADE;"`
	MaterialLinks []MaterialLink `gorm:"foreignKey:MaterialId;constraint:OnDelete:CASCADE;"`
}

func (material *Material) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	material.ID = id.String()
	return err
}

type MaterialFile struct {
	ID         string `gorm:"primaryKey"`
	FileName   string `gorm:"not null"`
	UniqueFileName string `gorm:"not null"`
	FileUrl    string `gorm:"not null"`
	MaterialId string
}

func (materialFile *MaterialFile) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	materialFile.ID = id.String()
	return err
}

type MaterialLink struct {
	ID         string `gorm:"primaryKey"`
	LinkName   string `gorm:"not null"`
	LinkUrl    string `gorm:"not null"`
	MaterialId string
}

func (materialLink *MaterialLink) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	materialLink.ID = id.String()
	return err
}

func NewMaterialLink(linkName, linkUrl, materialId string) *MaterialLink {
	return &MaterialLink{LinkName: linkName, LinkUrl: linkUrl, MaterialId: materialId}
}
