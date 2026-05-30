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

type MediaService struct {
	materialService MaterialServiceInterface
}

type MediaKind string

const (
	MediaKindMaterial MediaKind = "materials"
	MediaKindProfile  MediaKind = "profiles"
	MediaKindAssignment MediaKind = "assignments"
)

type MediaServiceInterface interface {
	Upload(req data.MediaSingleRequest, kind MediaKind) (mediaUpload data.MediaUpload, uploadErr error)
	Remove(fileName string, kind MediaKind) error
	RemoveBatch(req data.DeleteFilesRequest, kind MediaKind) error
}
func NewMediaService(materialService MaterialServiceInterface) MediaServiceInterface {
	return &MediaService{materialService: materialService}
}
func (m *MediaService) Upload(req data.MediaSingleRequest, kind MediaKind) (mediaUpload data.MediaUpload, uploadErr error) {
	fileType := lib.DetectFileType(req.File.Filename)
	req.File.Filename = filepath.Base(req.File.Filename)
	if !lib.IsAllowedFileType(req.File.Filename, fileType) {
		return data.MediaUpload{}, errors.New("Invalid file type")
	}
	uniqueFileName := lib.GenerateUniqueFilename(req.File.Filename)
	uploadPath := fmt.Sprintf("%s/%s/%s", env.BASE_STORAGE_PATH, kind, uniqueFileName)
	url := fmt.Sprintf("%s/media/%s/%s", env.BASE_URL, kind, uniqueFileName)
	return data.MediaUpload{FileUrl: url, UploadPath: uploadPath, File: req.File, FileName: req.File.Filename, UniqueFileName: uniqueFileName}, nil
}

func (m *MediaService) Remove(fileName string, kind MediaKind) error {
	baseFileName := filepath.Base(fileName)
	root := filepath.Join(env.BASE_STORAGE_PATH, string(kind))
	fullPath := filepath.Join(root, baseFileName)
	fmt.Println(fullPath)

	if !strings.HasPrefix(fullPath, root) {
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
	root := filepath.Join(env.BASE_STORAGE_PATH, string(kind))
	
	for _, file := range req.Files {
		fullPath := filepath.Join(root, file.UniqueFileName)
		if !strings.HasPrefix(fullPath, root) {
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
