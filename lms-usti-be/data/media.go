package data

import "mime/multipart"

type MediaSingleRequest struct {
	File *multipart.FileHeader `form:"file" binding:"required"`
}
type MediaMultipleRequest struct {
	Files []*multipart.FileHeader `form:"files" binding:"required"`
	Type  string                  `form:"type" binding:"required"`
}
type MediaSingleResponse struct {
	FileName       string `json:"file_name"`
	UniqueFileName string `json:"unique_file_name"`
	FileUrl        string `json:"file_url"`
}

type MediaUpload struct {
	FileUrl        string
	UploadPath     string
	UniqueFileName string
	FileName       string
	File           *multipart.FileHeader
}

type DeleteFilesRequest struct {
	Files []MediaSingleResponse `json:"files" binding:"required"`
}
