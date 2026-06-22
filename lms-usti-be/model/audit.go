package model

import "gorm.io/gorm"

type AuditLogs struct {
	gorm.Model
	Title       string `gorm:"not null"`
	Description string `gorm:"not null"`
}

