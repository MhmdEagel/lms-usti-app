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

type AdminController struct {
	adminService services.AdminServiceInterface
}

func NewAdminController(adminService services.AdminServiceInterface) *AdminController {
	return &AdminController{adminService: adminService}
}

func (a *AdminController) CreateUser(ctx *gin.Context) {
	var req data.RegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	adminId := getUserID(ctx)
	if err := a.adminService.CreateUser(req, adminId); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "create user success", nil)
	ctx.JSON(http.StatusOK, res)
}

func (a *AdminController) FindAllUsers(ctx *gin.Context) {
	limit, _ := strconv.Atoi(ctx.Query("limit"))
	page, _ := strconv.Atoi(ctx.Query("page"))

	pagination := data.Pagination{Limit: limit, Current: page}
	paginationResult, err := a.adminService.FindAllUsers(pagination)
	if err != nil {
		log.Printf("FindAllUsers: %v", err)
		appErr := data.ErrInternalServer(nil)
		res := data.NewResponseFromError(appErr)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewPaginationResponse(http.StatusOK, "successfully find all users", paginationResult.Pagination, paginationResult.Data)
	ctx.JSON(http.StatusOK, res)
}

func (a *AdminController) UpdateUser(ctx *gin.Context) {
	var req data.UpdateUserReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	userId := ctx.Param("id")
	req.ID = userId
	adminId := getUserID(ctx)
	err := a.adminService.UpdateUser(req, adminId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "user not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("UpdateUser: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := data.NewResponse(http.StatusOK, "user successfully updated", nil)
	ctx.JSON(http.StatusOK, res)
}

func (a *AdminController) FindUserById(ctx *gin.Context) {
	userId := ctx.Param("id")
	user, err := a.adminService.FindUserById(userId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "user not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("FindUserById: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "successfully find user", user)
	ctx.JSON(http.StatusOK, res)
}

func (a *AdminController) DeleteUser(ctx *gin.Context) {
	userId := ctx.Param("id")
	adminId := getUserID(ctx)
	err := a.adminService.DeleteUser(userId, adminId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "user not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		log.Printf("DeleteUser: %v", err)
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan server", nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "user successfully deleted", nil)
	ctx.JSON(http.StatusOK, res)
}

func getUserID(ctx *gin.Context) string {
	val, exist := ctx.Get("user")
	if !exist {
		return ""
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		return ""
	}
	return user.ID
}

func (a *AdminController) SendResetUserPassword(ctx *gin.Context) {
	var req data.SendVerificationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	err := a.adminService.SendVerificationEmail(req)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "email successfully sent", nil)
	ctx.JSON(http.StatusOK, res)
}
