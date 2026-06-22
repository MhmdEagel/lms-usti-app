package config

import (
	"fmt"
	"log"

	"github.com/MhmdEagel/lms-usti-be/env"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

const (
	defaultAdminEmail    = "admin@lms-usti.com"
	defaultAdminPassword = "admin123"
)
func SeedAdmin(Db *gorm.DB) {
	Db.Exec("ALTER TABLE users MODIFY COLUMN role varchar(20) NOT NULL DEFAULT ''")

	email := env.ADMIN_EMAIL
	password := env.ADMIN_PASSWORD

	if email == "" {
		email = defaultAdminEmail
	}
	if password == "" {
		password = defaultAdminPassword
	}

	var count int64
	Db.Model(&model.User{}).Where("email = ?", email).Count(&count)
	if count > 0 {
		log.Println("Admin already exists, skipping seed")
		return
	}

	hashedPassword, err := lib.HashPassword(password)
	if err != nil {
		log.Printf("Failed to hash admin password: %v", err)
		return
	}

	admin := model.User{
		Fullname: "Administrator",
		Email:    email,
		Password: hashedPassword,
		Role:     "ADMIN",
	}

	if err := Db.Create(&admin).Error; err != nil {
		log.Printf("Failed to seed admin user: %v", err)
		return
	}

	fmt.Println("Admin user seeded successfully")
}
