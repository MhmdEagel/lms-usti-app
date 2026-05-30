package controllers

import (
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/gin-gonic/gin"
)

type NotFoundController struct{}

func NewNotFoundController() *NotFoundController {
	return &NotFoundController{}
}

func (n *NotFoundController) NotFound(ctx *gin.Context) {
	res := data.NewResponse(http.StatusNotFound, "route not found", nil)
	ctx.JSON(http.StatusNotFound, res)	
}