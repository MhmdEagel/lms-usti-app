package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID                     string         `json:"userId" gorm:"primary_key;not null"`
	Fullname               string         `json:"fullname" gorm:"not null"`
	Email                  string         `json:"email" gorm:"unique;not null"`
	Image                  string         `json:"profile,omitempty"`
	Password               string         `json:"-" gorm:"not null"`
	Role                   string         `json:"role" gorm:"type:enum('DOSEN', 'MAHASISWA', 'PRODI')"`
	DosenClassrooms        []Classroom    `json:"dosenClassrooms,omitempty" gorm:"foreignKey:DosenId;"`
	MahasiswaClassrooms    []Classroom    `json:"mahasiswaClassrooms,omitempty" gorm:"many2many:classroom_mahasiswas;constraint:OnDelete:CASCADE;"`
	ClassroomAnnouncements []Announcement `json:"dosenAnnouncements,omitempty" gorm:"foreignKey:DosenId;constraint:OnDelete:CASCADE;"`
}

func (user *User) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	user.ID = id.String()
	return err
}
