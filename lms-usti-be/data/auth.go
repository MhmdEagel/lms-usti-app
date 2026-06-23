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
	UserId   string `json:"userId"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Fullname string `json:"fullname"`
	Profile  string `json:"profile"`
	Nim      string `json:"nim,omitempty"`
	Nidn     string `json:"nidn,omitempty"`
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
