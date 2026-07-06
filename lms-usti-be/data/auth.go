package data

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type UpdateProfileRequest struct {
	Fullname *string `json:"fullname"`
	Email    *string `json:"email"`
	Profile  *string `json:"profile"`
}
type MeResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Fullname string `json:"fullname"`
	Profile  string `json:"profile"`
	Nim      string `json:"nim,omitempty"`
	Nidn     string `json:"nidn,omitempty"`
}
type MahasiswaResponse struct {
	ID       string `json:"id"`
	Profile  string `json:"profile"`
	Fullname string `json:"fullname"`
}
type SendOTPRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
}
type VerifyOTPRequest struct {
	OTP         string `json:"otp" binding:"required"`
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}
type LoginResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}
