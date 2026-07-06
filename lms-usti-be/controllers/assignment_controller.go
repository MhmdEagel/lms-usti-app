package controllers

import (
	"net/http"
	"strconv"

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
	search := ctx.Query("search")
	limit, _ := strconv.Atoi(ctx.Query("limit"))
	page, _ := strconv.Atoi(ctx.Query("page"))

	val, _ := ctx.Get("user")
	user := val.(data.MeResponse)
	userId := user.ID

	pagination := data.Pagination{Limit: limit, Current: page}
	paginatedResult, err := a.assignmentService.FindAll(classroomId, search, pagination, userId)
	if err != nil {
		if appErr, ok := err.(*data.AppError); ok {
			res := data.NewResponseFromError(appErr)
			ctx.JSON(appErr.Code, res)
			return
		}
		handleError(ctx, err)
		return
	}
	res := data.NewPaginationResponse(http.StatusOK, "berhasil mengambil semua assignment", paginatedResult.Pagination, paginatedResult.Data)
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

func (a *AssignmentController) FindWaitingGrade(ctx *gin.Context) {
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
	waitingGrades, err := a.assignmentService.FindWaitingGrade(user.ID)
	if err != nil {
		handleError(ctx, err)
		return
	}
	if waitingGrades == nil {
		waitingGrades = []data.AssignmentWaitingGradeResponse{}
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil tugas menunggu penilaian", waitingGrades)
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
