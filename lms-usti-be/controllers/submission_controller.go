package controllers

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
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
		res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
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
	fmt.Println(req.SubmissionId)
	submission, err := s.submissionService.FindById(req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "successfully find submission by id", submission)
	ctx.JSON(http.StatusOK, res)
}

func (s *SubmissionController) Submit(ctx *gin.Context) {
	var req data.SubmitRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		msg := lib.GetValidationMessage(err.(validator.ValidationErrors))
		res := data.NewResponse(http.StatusBadRequest, msg, nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	classroomId := ctx.Param("id")
	assignmentId := ctx.Param("assignmentId")
	user := val.(data.MeResponse)
	req.AssigmentId = assignmentId
	req.UserId = user.UserId
	req.ClassroomId = classroomId
	err := s.submissionService.Submit(req)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "successfully submit assignment", nil)
	ctx.JSON(http.StatusOK, res)
}
