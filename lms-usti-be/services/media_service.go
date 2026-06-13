package services

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/env"
	"github.com/MhmdEagel/lms-usti-be/lib"
)

type MediaService struct{}

type MediaKind string

const (
	MediaKindMaterial   MediaKind = "materials"
	MediaKindProfile    MediaKind = "profiles"
	MediaKindAssignment MediaKind = "assignments"
)

type MediaServiceInterface interface {
	Upload(req data.MediaSingleRequest, kind MediaKind) (mediaUpload data.MediaUpload, uploadErr error)
	Remove(fileName string, kind MediaKind) error
	RemoveBatch(req data.DeleteFilesRequest, kind MediaKind) error
}
func NewMediaService() MediaServiceInterface {
	return &MediaService{}
}
func (m *MediaService) Upload(req data.MediaSingleRequest, kind MediaKind) (mediaUpload data.MediaUpload, uploadErr error) {
	if err := lib.ValidateFile(req.File); err != nil {
		return data.MediaUpload{}, data.ErrBadRequest(err)
	}
	req.File.Filename = filepath.Base(req.File.Filename)
	uniqueFileName := lib.GenerateUniqueFilename(req.File.Filename)
	uploadPath := fmt.Sprintf("%s/%s/%s", env.BASE_STORAGE_PATH, kind, uniqueFileName)
	url := fmt.Sprintf("%s/media/%s/%s", env.BASE_URL, kind, uniqueFileName)
	return data.MediaUpload{FileUrl: url, UploadPath: uploadPath, File: req.File, FileName: req.File.Filename, UniqueFileName: uniqueFileName}, nil
}

func (m *MediaService) Remove(fileName string, kind MediaKind) error {
	baseFileName := filepath.Base(fileName)
	root := filepath.Clean(filepath.Join(env.BASE_STORAGE_PATH, string(kind)))
	fullPath := filepath.Clean(filepath.Join(root, baseFileName))

	if !strings.HasPrefix(fullPath, root+string(filepath.Separator)) {
		return errors.New("Invalid file path")
	}
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return errors.New("File not found")
	}
	if err := os.Remove(fullPath); err != nil {
		return errors.New("Failed to delete file")
	}
	return nil
}

func (m *MediaService) RemoveBatch(req data.DeleteFilesRequest, kind MediaKind) error {
	root := filepath.Clean(filepath.Join(env.BASE_STORAGE_PATH, string(kind)))

	for _, fileUrl := range req.Files {
		fileName := filepath.Base(fileUrl)
		fullPath := filepath.Clean(filepath.Join(root, fileName))
		if !strings.HasPrefix(fullPath, root+string(filepath.Separator)) {
			return errors.New("Invalid file path")
		}
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			return errors.New("File not found")
		}
		if err := os.Remove(fullPath); err != nil {
			return errors.New("Something went wrong")
		}

	}
	return nil
}
