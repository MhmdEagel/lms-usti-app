package data

type MaterialRequest struct {
	Title       string              `json:"title" binding:"required"`
	Description string              `json:"description"`
	Attachments []AttachmentRequest `json:"attachments"`
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
	Title       string              `json:"title"`
	Description string              `json:"description"`
	Attachments []AttachmentRequest `json:"attachments"`
	ClassroomId string
}
