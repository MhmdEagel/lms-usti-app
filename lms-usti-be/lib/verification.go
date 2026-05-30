package lib

import (
	"time"

	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/google/uuid"
)

func IsTokenVerificationExpired(expires *time.Time) bool {
	val := expires.Compare(time.Now())
	return val == -1
}

func NewVerificationToken(email string) model.VerificationToken {
	id := uuid.New()
	token := id.String()
	expires := time.Now().Add(10 * time.Minute)
	verificationToken := model.VerificationToken{Email: email, Token: token, Expires: expires}
	return verificationToken
}
