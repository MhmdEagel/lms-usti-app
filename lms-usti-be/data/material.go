package data

type MaterialRequest struct {
	Title       string              `form:"title" binding:"required"`
	Description string              `form:"description"`
	Attachments []AttachmentRequest `form:"attachments"`
	ClassroomId string
}

type MaterialResponse struct {
	Id          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type MaterialDetailResponse struct {
	Id          string               `json:"id"`
	Title       string               `json:"title"`
	Description string               `json:"description"`
	Attachments []AttachmentResponse `json:"attachments"`
}

type MaterialUpdateRequest struct {
	Id          string
	Title       string              `form:"title"`
	Description string              `form:"description"`
	Attachments []AttachmentRequest `form:"attachments"`
	ClassroomId string
}
