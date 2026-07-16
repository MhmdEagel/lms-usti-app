package model

import "gorm.io/gorm"

type AuditLogs struct {
	gorm.Model
	Title       string `gorm:"not null"`
	Description string `gorm:"type:text;not null"`
	CreatedBy   string `gorm:"not null"`
	User        User   `gorm:"foreignKey:CreatedBy;references:ID"`
}

