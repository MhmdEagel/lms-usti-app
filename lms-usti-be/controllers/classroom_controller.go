package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type ClassroomController struct {
	classroomService services.ClassroomServiceInterface
}

func NewClassroomController(classroomService services.ClassroomServiceInterface) *ClassroomController {
	return &ClassroomController{classroomService: classroomService}
}

func (c *ClassroomController) Create(ctx *gin.Context) {
	var req data.CreateClassroomRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		msg := lib.GetValidationMessage(err.(validator.ValidationErrors))
		res := data.NewResponse(http.StatusBadRequest, msg, nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user := val.(data.MeResponse)
	req.DosenId = user.UserId
	err := c.classroomService.Create(req)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := data.NewResponse(http.StatusOK, "successfully create classroom", nil)
	ctx.JSON(http.StatusOK, res)

}

func (c *ClassroomController) FindAllByDosenId(ctx *gin.Context) {
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user := val.(data.MeResponse)

	limit, _ := strconv.Atoi(ctx.Query("limit"))
	page, _ := strconv.Atoi(ctx.Query("page"))

	pagination := data.Pagination{Limit: limit, Current: page}
	paginationResult, err := c.classroomService.FindAllByDosenId(user.UserId, pagination)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
	}
	res := data.NewPaginationResponse(http.StatusOK, "successfully find all dosen classrooms", paginationResult.Pagination, paginationResult.Data)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) FindById(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	classroom, err := c.classroomService.FindById(classroomId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	fmt.Println(classroom, err)

	res := data.NewResponse(http.StatusOK, "success find classroom by id", classroom)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) FindAllByMahasiswaId(ctx *gin.Context) {
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user := val.(data.MeResponse)

	limit, _ := strconv.Atoi(ctx.Query("limit"))
	page, _ := strconv.Atoi(ctx.Query("page"))

	pagination := data.Pagination{Limit: limit, Current: page}
	paginationResult, err := c.classroomService.FindAllByMahasiswaId(user.UserId, pagination)
	if err != nil {
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
	}

	res := data.NewPaginationResponse(http.StatusOK, "successfully find all mahasiswa classrooms", paginationResult.Pagination, paginationResult.Data)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) Update(ctx *gin.Context) {
	var req data.UpdateClassroomRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		msg := lib.GetValidationMessage(err.(validator.ValidationErrors))
		res := data.NewResponse(http.StatusBadRequest, msg, nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}
	classroomId := ctx.Param("id")
	req.Id = classroomId
	err := c.classroomService.Update(req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			fmt.Println("API HITTO!")
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := data.NewResponse(http.StatusOK, "classroom successfully updated", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) Delete(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	val, exist := ctx.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	user := val.(data.MeResponse)
	err := c.classroomService.Delete(classroomId, user.UserId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := data.NewResponse(http.StatusOK, "classroom successfully deleted", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) Enroll(ctx *gin.Context) {
	var req data.JoinClassroomRequest
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
	user := val.(data.MeResponse)
	err := c.classroomService.EnrollMahasiswa(req, user.UserId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusBadRequest, "classroom not found", nil)
			ctx.JSON(http.StatusBadRequest, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success join classroom", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomController) FindAllClassroomMember(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	classroomMembers, err := c.classroomService.FindAllClassroomMember(classroomId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success find all classroom member", classroomMembers)
	ctx.JSON(http.StatusOK, res)
}
