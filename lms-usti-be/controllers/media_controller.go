package controllers

import (
	"errors"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/env"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type MediaController struct {
	mediaService services.MediaServiceInterface
}

func NewMediaController(mediaService services.MediaServiceInterface) *MediaController {
	return &MediaController{mediaService: mediaService}
}

func (m *MediaController) FindMaterialFile(ctx *gin.Context) {
	fileName := filepath.Base(ctx.Param("name"))
	root := filepath.Join(env.BASE_STORAGE_PATH, "materials")
	fullPath := filepath.Join(root, fileName)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		res := data.NewResponse(http.StatusNotFound, "file not found", nil)
		ctx.JSON(http.StatusNotFound, res)
		return
	}
	ctx.File(fullPath)
}

func (m *MediaController) FindAssignmentFile(ctx *gin.Context) {
	fileName := filepath.Base(ctx.Param("name"))
	root := filepath.Join(env.BASE_STORAGE_PATH, "assignments")
	fullPath := filepath.Join(root, fileName)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		res := data.NewResponse(http.StatusNotFound, "file not found", nil)
		ctx.JSON(http.StatusNotFound, res)
		return
	}
	ctx.File(fullPath)
}

func (m *MediaController) FindProfilePicture(ctx *gin.Context) {
	fileName := filepath.Base(ctx.Param("name"))
	root := filepath.Join(env.BASE_STORAGE_PATH, "profiles")
	fullPath := filepath.Join(root, fileName)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		res := data.NewResponse(http.StatusNotFound, "file not found", nil)
		ctx.JSON(http.StatusNotFound, res)
		return
	}
	ctx.File(fullPath)
}

func (m *MediaController) uploadMedia(ctx *gin.Context, kind services.MediaKind, successMsg string) {
	var req data.MediaSingleRequest
	if err := ctx.ShouldBind(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			msg := lib.GetValidationMessage(ve)
			res := data.NewResponse(http.StatusBadRequest, msg, nil)
			ctx.JSON(http.StatusBadRequest, res)
			return
		}
		log.Printf("Upload bind error: %v", err)
		res := data.NewResponse(http.StatusBadRequest, "invalid request", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	uploadData, err := m.mediaService.Upload(req, kind)
	if err != nil {
		appErr, ok := err.(*data.AppError)
		if ok {
			res := data.NewResponseFromError(appErr)
			ctx.JSON(appErr.Code, res)
			return
		}
		log.Printf("Upload error: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	if err := ctx.SaveUploadedFile(uploadData.File, uploadData.UploadPath); err != nil {
		log.Printf("SaveUploadedFile error: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	file := data.MediaSingleResponse{FileName: uploadData.FileName, FileUrl: uploadData.FileUrl, UniqueFileName: uploadData.UniqueFileName}
	res := data.NewResponse(http.StatusOK, successMsg, file)
	ctx.JSON(http.StatusOK, res)
}

func (m *MediaController) UploadMaterial(ctx *gin.Context) {
	m.uploadMedia(ctx, services.MediaKindMaterial, "file berhasil diupload")
}

func (m *MediaController) UploadAssignment(ctx *gin.Context) {
	m.uploadMedia(ctx, services.MediaKindAssignment, "file berhasil diupload")
}

func (m *MediaController) UploadProfilePicture(ctx *gin.Context) {
	m.uploadMedia(ctx, services.MediaKindProfile, "profile picture berhasil diupload")
}

func (m *MediaController) removeMedia(ctx *gin.Context, kind services.MediaKind, successMsg string) {
	rawName := ctx.Param("name")
	err := m.mediaService.Remove(rawName, kind)
	if err != nil {
		appErr, ok := err.(*data.AppError)
		if ok {
			res := data.NewResponseFromError(appErr)
			ctx.JSON(appErr.Code, res)
			return
		}
		log.Printf("Remove error: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, successMsg, nil)
	ctx.JSON(http.StatusOK, res)
}

func (m *MediaController) RemoveMaterial(ctx *gin.Context) {
	m.removeMedia(ctx, services.MediaKindMaterial, "material berhasil dihapus")
}

func (m *MediaController) RemoveAssignment(ctx *gin.Context) {
	m.removeMedia(ctx, services.MediaKindAssignment, "assignment berhasil dihapus")
}

func (m *MediaController) RemoveProfilePicture(ctx *gin.Context) {
	m.removeMedia(ctx, services.MediaKindProfile, "profile picture berhasil dihapus")
}

func (m *MediaController) removeMediaBatch(ctx *gin.Context, kind services.MediaKind, successMsg string) {
	var req data.DeleteFilesRequest
	if err := ctx.ShouldBind(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			msg := lib.GetValidationMessage(ve)
			res := data.NewResponse(http.StatusBadRequest, msg, nil)
			ctx.JSON(http.StatusBadRequest, res)
			return
		}
		log.Printf("RemoveBatch bind error: %v", err)
		res := data.NewResponse(http.StatusBadRequest, "invalid request", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	err := m.mediaService.RemoveBatch(req, kind)
	if err != nil {
		appErr, ok := err.(*data.AppError)
		if ok {
			res := data.NewResponseFromError(appErr)
			ctx.JSON(appErr.Code, res)
			return
		}
		log.Printf("RemoveBatch error: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, successMsg, nil)
	ctx.JSON(http.StatusOK, res)
}

func (m *MediaController) RemoveMaterialBatch(ctx *gin.Context) {
	m.removeMediaBatch(ctx, services.MediaKindMaterial, "berhasil menghapus material secara batch")
}

func (m *MediaController) RemoveAssignmentBatch(ctx *gin.Context) {
	m.removeMediaBatch(ctx, services.MediaKindAssignment, "berhasil menghapus assignment secara batch")
}
