package data

type RegisterRequest struct {
	Fullname string `json:"fullname" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"required,oneof=MAHASISWA DOSEN PRODI ADMIN"`
}

type UpdateUserReq struct {
	UserId   string  `json:"userId"`
	Email    *string `json:"email"`
	Role     *string `json:"role"`
	Fullname *string `json:"fullname"`
}
