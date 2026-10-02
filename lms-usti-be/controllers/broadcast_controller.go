package controllers

import (
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
)

type BroadcastController struct {
	broadcastService services.BroadcastServiceInterface
}

func NewBroadcastController(broadcastService services.BroadcastServiceInterface) *BroadcastController {
	return &BroadcastController{broadcastService: broadcastService}
}

func (c *BroadcastController) Send(ctx *gin.Context) {
	var req data.BroadcastMessageRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	result, err := c.broadcastService.Send(ctx.Param("id"), user.ID, user.Fullname, req)
	if err != nil {
		handleError(ctx, err)
		return
	}

	res := data.NewResponse(http.StatusOK, "broadcast berhasil dikirim", result)
	ctx.JSON(http.StatusOK, res)
}
