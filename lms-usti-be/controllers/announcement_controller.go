package controllers

import (
	"errors"
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type AnnouncementController struct {
	announcementService services.AnnouncementServiceInterface
}

func NewAnnouncementController(announcementService services.AnnouncementServiceInterface) *AnnouncementController {
	return &AnnouncementController{announcementService: announcementService}
}

func (a *AnnouncementController) FindAll(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	announcements, err := a.announcementService.FindAll(classroomId)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success find all classroom announcements", announcements)
	ctx.JSON(http.StatusOK, res)
}

func (a *AnnouncementController) Create(ctx *gin.Context) {
	var req data.AnnouncementRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		if errors.Is(err, validator.ValidationErrors{}) {
			msg := lib.GetValidationMessage(err.(validator.ValidationErrors))
			res := data.NewResponse(http.StatusBadRequest, msg, nil)
			ctx.JSON(http.StatusBadRequest, res)
			return
		}
		res := data.NewResponse(http.StatusBadRequest, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user := val.(data.MeResponse)
	classroomId := ctx.Param("id")
	req.ClassroomId = classroomId
	req.DosenId = user.UserId
	err := a.announcementService.Create(req)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success create a classroom announcement", nil)
	ctx.JSON(http.StatusOK, res)

}

func (a *AnnouncementController) Delete(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	announcementId := ctx.Param("announcementId")
	err := a.announcementService.Delete(announcementId, classroomId)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success delete a classroom announcement", nil)
	ctx.JSON(http.StatusOK, res)
}
