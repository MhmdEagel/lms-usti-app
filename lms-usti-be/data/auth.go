package data


type LoginRequest struct {
	Email    string `json:"email" binding:"required,email`
	Password string `json:"password" binding:"required,min=8"`
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
