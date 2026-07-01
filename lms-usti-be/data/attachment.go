package data

type AttachmentRequest struct {
	Name       string `json:"name" binding:"required"`
	Type       string `json:"type" binding:"required,oneof=FILE LINK"`
	Url        string `json:"url" binding:"required"`
	UniqueName string `json:"unique_name"`
}

type AttachmentResponse struct {
	Id         string `json:"id"`
	Name       string `json:"name"`
	Type       string `json:"type"`
	Url        string `json:"url"`
	UniqueName string `json:"unique_name"`
}
