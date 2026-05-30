package data

type MaterialRequest struct {
	Title       string        `form:"title" binding:"required"`
	Description string        `form:"description"`
	Files       []FileRequest `form:"files"`
	Links       []LinkRequest `form:"links"`
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
	Id          string         `json:"id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Files       []FileResponse `json:"files"`
	Links       []LinkResponse `json:"links"`
}

type MaterialUpdateRequest struct {
	Id          string
	Title       string        `form:"title"`
	Description string        `form:"description"`
	Files       []FileRequest `form:"files"`
	Links       []LinkRequest `form:"links"`
	ClassroomId string
}

type FileRequest struct {
	Id string `form:"id" json:"id"`
	FileName string `form:"file_name" json:"file_name"`
	UniqueFileName string `form:"unique_file_name" json:"unique_file_name"`
	FileUrl  string `form:"file_url" json:"file_Url"`
}

type FileResponse struct {
	Id       string `json:"id"`
	FileName string `json:"file_name"`
	UniqueFileName string `json:"unique_file_name"`
	FileUrl  string `json:"file_url"`
}

type LinkRequest struct {
	Id string `form:"id" json:"id"`
	LinkName string `form:"link_name" json:"link_name"`
	LinkUrl  string `form:"link_url" json:"link_url"`
}

type LinkResponse struct {
	Id       string `json:"id"`
	LinkName string `json:"link_name"`
	LinkUrl  string `json:"link_url"`
}
