package data

type VerificationRequest struct {
	Token string `json:"token" binding:"required"`
}

type NewPasswordRequest struct {
	Token string `json:"token" binding:"required"`
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type SendVerificationRequest struct {
	Email string `json:"email" binding:"required,email"`
}