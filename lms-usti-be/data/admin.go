package data

type UpdateUserReq struct {
	UserId   string  `json:"userId"`
	Email    *string `json:"email"`
	Role     *string `json:"role"`
	Fullname *string `json:"fullname"`
}
