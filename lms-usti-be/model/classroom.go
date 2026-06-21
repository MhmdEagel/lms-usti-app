package model

import (
	"fmt"
	"strings"
	"time"

	// "github.com/MhmdEagel/lms-usti-be/data"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Classroom struct {
	ID                    string    `gorm:"unique;primaryKey;not null"`
	ClassCover            string    `gorm:"not null"`
	ClassCode             string    `gorm:"unique;not null"`
	ClassName             string    `gorm:"not null"`
	Term                  int       `gorm:"not null"`
	RoomNumber            int       `gorm:"not null"`
	Day                   int       `gorm:"not null"`
	ClassStart            time.Time `gorm:"not null"`
	ClassEnd              time.Time `gorm:"not null"`
	DosenId               string
	Dosen                 User           `gorm:"foreignKey:DosenId"`
	Prodi                 string         `gorm:"not null"`
	ClassroomMahasiswa    []User         `gorm:"many2many:classroom_mahasiswas;constraint:OnDelete:CASCADE;"`
	ClassroomAnnouncement []Announcement `gorm:"foreignKey:ClassroomId;constraint:OnDelete:CASCADE;"`
	Materials             []Material     `gorm:"foreignKey:ClassroomId;constraint:OnDelete:CASCADE;"`
	Assignments           []Assignment   `gorm:"foreignKey:ClassroomId;constraint:OnDelete:CASCADE;"`
}
type ClassroomMahasiswa struct {
	UserId      string    `gorm:"primaryKey"`
	ClassroomId string    `gorm:"primaryKey"`
	User        User      `gorm:"foreignKey:UserId;constraint:OnDelete:CASCADE"`
	Classroom   Classroom `gorm:"foreignKey:ClassroomID;constraint:OnDelete:CASCADE"`
}

func (classroom *Classroom) BeforeCreate(tx *gorm.DB) error {
	classId, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	classCodeId, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	classCode := fmt.Sprintf("KLS-%s", strings.ToUpper(strings.ReplaceAll(classCodeId.String()[:5], "-", "")))
	classroom.ID = classId.String()
	classroom.ClassCode = classCode
	return nil
}
