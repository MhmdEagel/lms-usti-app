package controllers

import (
	"errors"
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

func (m *MediaController) UploadMaterial(ctx *gin.Context) {
	var req data.MediaSingleRequest
	if err := ctx.ShouldBind(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			msg := lib.GetValidationMessage(ve)
			res := data.NewResponse(http.StatusBadRequest, msg, nil)
			ctx.JSON(http.StatusBadRequest, res)
			return
		}
		res := data.NewResponse(http.StatusBadRequest, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	uploadData, err := m.mediaService.Upload(req, services.MediaKindMaterial)
	
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	if err := ctx.SaveUploadedFile(uploadData.File, uploadData.UploadPath); err != nil {
		res := data.NewResponse(http.StatusInternalServerError, "Something went wrong", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	file := data.MediaSingleResponse{FileName: uploadData.FileName, FileUrl: uploadData.FileUrl, UniqueFileName: uploadData.UniqueFileName}
	res := data.NewResponse(http.StatusOK, "File successfully uploaded", file)
	ctx.JSON(http.StatusOK, res)
}

func (m *MediaController) UploadAssignment(ctx *gin.Context) {
	var req data.MediaSingleRequest
	if err := ctx.ShouldBind(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			msg := lib.GetValidationMessage(ve)
			res := data.NewResponse(http.StatusBadRequest, msg, nil)
			ctx.JSON(http.StatusBadRequest, res)
			return
		}
		res := data.NewResponse(http.StatusBadRequest, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	uploadData, err := m.mediaService.Upload(req, services.MediaKindAssignment)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	if err := ctx.SaveUploadedFile(uploadData.File, uploadData.UploadPath); err != nil {
		res := data.NewResponse(http.StatusInternalServerError, "Something went wrong", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	
	file := data.MediaSingleResponse{FileName: uploadData.FileName, FileUrl: uploadData.FileUrl, UniqueFileName: uploadData.UniqueFileName}
	res := data.NewResponse(http.StatusOK, "File successfully uploaded", file)
	ctx.JSON(http.StatusOK, res)
}

func (m *MediaController) UploadProfilePicture(ctx *gin.Context) {
	var req data.MediaSingleRequest
	if err := ctx.ShouldBind(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			msg := lib.GetValidationMessage(ve)
			res := data.NewResponse(http.StatusBadRequest, msg, nil)
			ctx.JSON(http.StatusBadRequest, res)
			return
		}
		res := data.NewResponse(http.StatusBadRequest, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	uploadData, err := m.mediaService.Upload(req, services.MediaKindProfile)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	file := data.MediaSingleResponse{FileName: uploadData.FileName, FileUrl: uploadData.FileUrl, UniqueFileName: uploadData.UniqueFileName}
	res := data.NewResponse(http.StatusOK, "File successfully uploaded", file)
	ctx.JSON(http.StatusOK, res)
}

func (m *MediaController) RemoveMaterial(ctx *gin.Context) {
	rawName := ctx.Param("name")
	err := m.mediaService.Remove(rawName, services.MediaKindMaterial)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "material successfully removed", nil)
	ctx.JSON(http.StatusOK, res)
}

func (m *MediaController) RemoveAssignment(ctx *gin.Context) {
	rawName := ctx.Param("name")
	err := m.mediaService.Remove(rawName, services.MediaKindAssignment)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "material successfully removed", nil)
	ctx.JSON(http.StatusOK, res)
}

func (m *MediaController) RemoveMaterialBatch(ctx *gin.Context) {
	var req data.DeleteFilesRequest
	if err := ctx.ShouldBind(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			msg := lib.GetValidationMessage(ve)
			res := data.NewResponse(http.StatusBadRequest, msg, nil)
			ctx.JSON(http.StatusBadRequest, res)
			return
		}
		res := data.NewResponse(http.StatusBadRequest, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	err := m.mediaService.RemoveBatch(req, services.MediaKindMaterial)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, "failed to delete file", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "successfully delete materials in batch", nil)
	ctx.JSON(http.StatusOK, res)
}

func (m *MediaController) RemoveAssignmentBatch(ctx *gin.Context) {
	var req data.DeleteFilesRequest
	if err := ctx.ShouldBind(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			msg := lib.GetValidationMessage(ve)
			res := data.NewResponse(http.StatusBadRequest, msg, nil)
			ctx.JSON(http.StatusBadRequest, res)
			return
		}
		res := data.NewResponse(http.StatusBadRequest, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	err := m.mediaService.RemoveBatch(req, services.MediaKindAssignment)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, "failed to delete file", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "successfully delete materials in batch", nil)
	ctx.JSON(http.StatusOK, res)
}

func (m *MediaController) RemoveProfilePicture(ctx *gin.Context) {
	rawName := ctx.Param("name")
	err := m.mediaService.Remove(rawName, services.MediaKindProfile)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "profile picture successfully removed", nil)
	ctx.JSON(http.StatusOK, res)
}
