package controllers

import (
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
)

type ClassroomPolicyController struct {
	classroomPolicyService services.ClassroomPolicyServiceInterface
}

func NewClassroomPolicyController(classroomPolicyService services.ClassroomPolicyServiceInterface) *ClassroomPolicyController {
	return &ClassroomPolicyController{classroomPolicyService: classroomPolicyService}
}

func (c *ClassroomPolicyController) FindByClassroomId(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	policy, err := c.classroomPolicyService.FindByClassroomId(classroomId)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil kebijakan kelas", policy)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomPolicyController) Update(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	var req data.ClassroomPolicyRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	if err := c.classroomPolicyService.Update(classroomId, req); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "kebijakan kelas berhasil diperbarui", nil)
	ctx.JSON(http.StatusOK, res)
}
