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
	database.AutoMigrate(&model.User{}, &model.VerificationToken{}, &model.Classroom{}, &model.ClassroomForumPost{}, &model.Material{}, &model.MaterialAttachment{}, &model.Assignment{}, &model.AssignmentAttachment{}, model.Submission{}, model.SubmissionAttachment{}, &model.AuditLogs{}, &model.Comment{}, &model.ForumPost{}, &model.ContentView{}, &model.ClassroomPolicy{})
	return database
}
