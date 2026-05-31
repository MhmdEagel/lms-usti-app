package controllers

import (
	"errors"
	"log"
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
	err := a.assignmentService.Create(req)
	if err != nil {
		log.Printf("Assignment Create: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "assignment successfully created", nil)
	ctx.JSON(http.StatusOK, res)
}

func (a *AssignmentController) FindAll(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	assignments, err := a.assignmentService.FindAll(classroomId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("Assignment FindAll: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "successfully fetch all assignments", assignments)
	ctx.JSON(http.StatusOK, res)
}

func (a *AssignmentController) FindById(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	assignmentId := ctx.Param("assignmentId")
	assignment, err := a.assignmentService.FindById(assignmentId, classroomId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "assignment not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("Assignment FindById: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "successfully fetch assignment", assignment)
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
	err := a.assignmentService.Update(req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "assignment not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("Assignment Update: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := data.NewResponse(http.StatusOK, "assignment successfully updated", nil)
	ctx.JSON(http.StatusOK, res)
}

func (a *AssignmentController) Delete(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	assignmentId := ctx.Param("assignmentId")
	err := a.assignmentService.Delete(assignmentId, classroomId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "assignment not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("Assignment Delete: %v", err)
		res := data.NewResponse(http.StatusBadRequest, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "assignment successfully deleted", nil)
	ctx.JSON(http.StatusOK, res)
}
