package controllers

import (
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
)

type AssignmentController struct {
	assignmentService services.AssignmentServiceInterface
}

func NewAssignmentController(assignmentService services.AssignmentServiceInterface) *AssignmentController {
	return &AssignmentController{assignmentService: assignmentService}
}

func (a *AssignmentController) Create(ctx *gin.Context) {
	var req data.AssignmentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	classroomId := ctx.Param("id")
	req.ClassroomId = classroomId
	if err := a.assignmentService.Create(req); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "assignment berhasil dibuat", nil)
	ctx.JSON(http.StatusOK, res)
}

func (a *AssignmentController) FindAll(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	assignments, err := a.assignmentService.FindAll(classroomId)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil semua assignment", assignments)
	ctx.JSON(http.StatusOK, res)
}

func (a *AssignmentController) FindById(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	assignmentId := ctx.Param("assignmentId")
	assignment, err := a.assignmentService.FindById(assignmentId, classroomId)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil assignment", assignment)
	ctx.JSON(http.StatusOK, res)
}

func (a *AssignmentController) Update(ctx *gin.Context) {
	var req data.AssignmentUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	classroomId := ctx.Param("id")
	assignmentId := ctx.Param("assignmentId")
	req.ClassroomId = classroomId
	req.ID = assignmentId
	if err := a.assignmentService.Update(req); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "assignment berhasil diperbarui", nil)
	ctx.JSON(http.StatusOK, res)
}

func (a *AssignmentController) Delete(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	assignmentId := ctx.Param("assignmentId")
	if err := a.assignmentService.Delete(assignmentId, classroomId); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "assignment berhasil dihapus", nil)
	ctx.JSON(http.StatusOK, res)
}
