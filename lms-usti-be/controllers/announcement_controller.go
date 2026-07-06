package controllers

import (
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
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
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil semua announcement", announcements)
	ctx.JSON(http.StatusOK, res)
}

func (a *AnnouncementController) Create(ctx *gin.Context) {
	var req data.AnnouncementRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	val, exist := ctx.Get("user")
	if !exist {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	classroomId := ctx.Param("id")
	req.ClassroomId = classroomId
	req.DosenId = user.ID
	err := a.announcementService.Create(req)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "announcement berhasil dibuat", nil)
	ctx.JSON(http.StatusOK, res)
}

func (a *AnnouncementController) Update(ctx *gin.Context) {
	var req data.AnnouncementUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	classroomId := ctx.Param("id")
	announcementId := ctx.Param("announcementId")
	err := a.announcementService.Update(announcementId, classroomId, req)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "announcement berhasil diperbarui", nil)
	ctx.JSON(http.StatusOK, res)
}

func (a *AnnouncementController) Delete(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	announcementId := ctx.Param("announcementId")
	err := a.announcementService.Delete(announcementId, classroomId)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "announcement berhasil dihapus", nil)
	ctx.JSON(http.StatusOK, res)
}
