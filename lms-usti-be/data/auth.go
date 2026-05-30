package data

import "time"

type RegisterRequest struct {
	Fullname string `json:"fullname" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"required,oneof=MAHASISWA DOSEN"`
}
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email`
	Password string `json:"password" binding:"required,min=8"`
}
type UpdateVerificationStatusRequest struct {
	EmailVerified time.Time `json:"email_verified" binding:"required"`
}
type MeResponse struct {
	UserId   string `json:"userId"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Fullname string `json:"fullname"`
}
type MahasiswaResponse struct {
	UserId   string `json:"userId"`
	Fullname string `json:"fullname"`
}
type LoginResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}
