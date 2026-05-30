package model

import (
	// "errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type VerificationToken struct {
	ID      string    `gorm:"primary_key;not null"`
	Email   string    `json:"email" gorm:"not null"`
	Token   string    `json:"token"`
	Expires time.Time `json:"expires"`
}
type Verification struct {
	Token string `json:"token" binding:"required"`
}
func (verification *VerificationToken) BeforeCreate(tx *gorm.DB) error {
	id, err := uuid.NewRandom()
	verification.ID = id.String()
	return err
}
func NewVerificationToken(email string) VerificationToken {
	id := uuid.New()
	token := id.String()
	expires := time.Now().Add(10 * time.Minute)
	return VerificationToken{Email: email, Token: token, Expires: expires}
}
