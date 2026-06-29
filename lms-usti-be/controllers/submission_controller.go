package controllers

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SubmissionController struct {
	submissionService services.SubmissionServiceInterface
}

func NewSubmissionController(submissionService services.SubmissionServiceInterface) *SubmissionController {
	return &SubmissionController{submissionService: submissionService}
}

func (s *SubmissionController) FindAll(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	assignmentId := ctx.Param("assignmentId")
	limit, _ := strconv.Atoi(ctx.Query("limit"))
	page, _ := strconv.Atoi(ctx.Query("page"))
	search := ctx.Query("search")
	filter := ctx.Query("filter")

	pagination := data.Pagination{Limit: limit, Current: page}
	paginatedResult, err := s.submissionService.FindAll(classroomId, assignmentId, search, filter, pagination)
	if err != nil {
		log.Printf("Submission FindAll: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewPaginationResponse(http.StatusOK, "successfully find all submissions", paginatedResult.Pagination, paginatedResult.Data)
	ctx.JSON(http.StatusOK, res)
}

func (s *SubmissionController) FindById(ctx *gin.Context) {
	assignmentId := ctx.Param("assignmentId")
	submissionId := ctx.Param("submissionId")
	classroomId := ctx.Param("id")
	req := data.SubmissionDetailRequest{
		AssignmentId: assignmentId,
		SubmissionId: submissionId,
		ClassroomId:  classroomId,
	}
	submission, err := s.submissionService.FindById(req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "submission not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("Submission FindById: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "successfully find submission by id", submission)
	ctx.JSON(http.StatusOK, res)
}

func (s *SubmissionController) FindMySubmission(ctx *gin.Context) {
	assignmentId := ctx.Param("assignmentId")
	val, _ := ctx.Get("user")
	user := val.(data.MeResponse)
	submission, err := s.submissionService.FindByAssignmentAndStudent(assignmentId, user.UserId)
	if err != nil {
		res := data.NewResponse(http.StatusOK, "no submission", nil)
		ctx.JSON(http.StatusOK, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success", submission)
	ctx.JSON(http.StatusOK, res)
}

func (s *SubmissionController) Submit(ctx *gin.Context) {
	var req data.SubmitRequest
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
	classroomId := ctx.Param("id")
	assignmentId := ctx.Param("assignmentId")
	req.AssigmentId = assignmentId
	req.UserId = user.UserId
	req.ClassroomId = classroomId
	err := s.submissionService.Submit(req)
	if err != nil {
		log.Printf("Submission Submit: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "successfully submit assignment", nil)
	ctx.JSON(http.StatusOK, res)
}
