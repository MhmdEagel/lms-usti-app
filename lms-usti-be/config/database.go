package config

import (
	"fmt"

	"github.com/MhmdEagel/lms-usti-be/env"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)


func ConnectDatabase() *gorm.DB {
	dsn := fmt.Sprintf("%s:%s@tcp(localhost:3306)/lms_usti?charset=utf8mb4&parseTime=True&loc=Local", env.DB_USERNAME, env.DB_PASSWORD)
	database, err := gorm.Open(mysql.New(mysql.Config{DSN: dsn, DefaultStringSize: 255}), &gorm.Config{TranslateError: true})
	if err != nil {
		panic(err.Error())
	}
	database.AutoMigrate(&model.User{}, &model.VerificationToken{}, &model.Classroom{}, &model.Announcement{}, &model.Material{}, &model.MaterialAttachment{}, &model.Assignment{}, &model.AssignmentRubric{}, &model.AssignmentAttachment{}, model.Submission{}, model.SubmissionAttachment{}, &model.AuditLogs{}, &model.Comment{})
	return database
}
