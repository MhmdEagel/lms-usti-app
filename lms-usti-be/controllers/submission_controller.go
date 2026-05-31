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

type SubmissionController struct {
	submissionService services.SubmissionServiceInterface
}

func NewSubmissionController(submissionService services.SubmissionServiceInterface) *SubmissionController {
	return &SubmissionController{submissionService: submissionService}
}

func (s *SubmissionController) FindAll(ctx *gin.Context) {
	assignmentId := ctx.Param("assignmentId")
	submissions, err := s.submissionService.FindAll(assignmentId)
	if err != nil {
		log.Printf("Submission FindAll: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "successfully find all submissions", submissions)
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
