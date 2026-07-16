package controllers

import (
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
)

type MeetingController struct {
	meetingService services.MeetingServiceInterface
}

func NewMeetingController(meetingService services.MeetingServiceInterface) *MeetingController {
	return &MeetingController{meetingService: meetingService}
}

func (c *MeetingController) Create(ctx *gin.Context) {
	var req data.MeetingRequest
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
	req.ClassroomId = ctx.Param("id")
	req.DosenId = user.ID
	if err := c.meetingService.Create(req); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusCreated, "pertemuan berhasil dibuat", nil)
	ctx.JSON(http.StatusCreated, res)
}

func (c *MeetingController) FindAll(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	search := ctx.Query("search")
	meetings, err := c.meetingService.FindAll(classroomId, search)
	if err != nil {
		handleError(ctx, err)
		return
	}
	if meetings == nil {
		meetings = []data.MeetingResponse{}
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil pertemuan", meetings)
	ctx.JSON(http.StatusOK, res)
}

func (c *MeetingController) FindById(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	meetingId := ctx.Param("meetingId")
	meeting, err := c.meetingService.FindById(meetingId, classroomId)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil pertemuan", meeting)
	ctx.JSON(http.StatusOK, res)
}

func (c *MeetingController) Update(ctx *gin.Context) {
	var req data.MeetingUpdateRequest
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
	meetingId := ctx.Param("meetingId")
	if err := c.meetingService.Update(meetingId, classroomId, user.ID, req); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "pertemuan berhasil diperbarui", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *MeetingController) Delete(ctx *gin.Context) {
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
	meetingId := ctx.Param("meetingId")
	if err := c.meetingService.Delete(meetingId, classroomId, user.ID); err != nil {
		handleError(ctx, err)
		return
	}
	ctx.JSON(http.StatusNoContent, nil)
}

func (c *MeetingController) Reorder(ctx *gin.Context) {
	var req data.ReorderRequest
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
	if err := c.meetingService.Reorder(classroomId, user.ID, req); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "pertemuan berhasil diurutkan ulang", nil)
	ctx.JSON(http.StatusOK, res)
}
