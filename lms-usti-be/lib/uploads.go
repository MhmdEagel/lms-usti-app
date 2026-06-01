package lib

import (
	"strings"

	"github.com/MhmdEagel/lms-usti-be/env"
)

type FileType string

const (
	FileTypeImage    FileType = "image"
	FileTypeDocument FileType = "document"
	FileTypeVideo    FileType = "video"
	FileTypeOther    FileType = "other"
)

type UploadConfig struct {
    MaxFileSize      int64
    MaxFiles         int
    AllowedTypes     map[FileType][]string
}

func GetUploadConfig() *UploadConfig {
	maxFileSize, _ := ParseSize(env.MAX_FILE_SIZE)
	maxFiles, _ := ParseInt(env.MAX_FILE_PER_REQUEST)

	allowedTypes := map[FileType][]string{
		FileTypeDocument: strings.Split("pdf,doc,docx,txt", ","),
		FileTypeImage:    strings.Split("jpg,jpeg,png,gif,webp", ","),
		FileTypeVideo:    strings.Split("mp4,mkv", ","),
	}

	return &UploadConfig{
		MaxFileSize:  maxFileSize,
		MaxFiles:     maxFiles,
		AllowedTypes: allowedTypes,
	}
}
