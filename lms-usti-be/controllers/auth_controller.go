package controllers

import (
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService services.AuthServiceInterface
}

func NewAuthController(authService services.AuthServiceInterface) *AuthController {
	return &AuthController{authService: authService}
}

func (a *AuthController) Login(c *gin.Context) {
	var req data.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bindJSONError(c, err)
		return
	}
	loginData, err := a.authService.Login(req)
	if err != nil {
		handleError(c, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "login success", loginData)
	c.JSON(http.StatusOK, res)
}


func (a *AuthController) ResendActivation(c *gin.Context) {
	var req data.SendVerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bindJSONError(c, err)
		return
	}
	err := a.authService.SendVerificationEmail(req)
	if err != nil {
		handleError(c, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "email successfully sent", nil)
	c.JSON(http.StatusOK, res)
}

func (a *AuthController) SendResetPasswordEmail(c *gin.Context) {
	var req data.SendVerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bindJSONError(c, err)
		return
	}
	err := a.authService.SendVerificationEmail(req)
	if err != nil {
		handleError(c, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "email successfully sent", nil)
	c.JSON(http.StatusOK, res)
}

func (a *AuthController) ResetPassword(c *gin.Context) {
	var req data.NewPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bindJSONError(c, err)
		return
	}
	err := a.authService.ResetPassword(req)
	if err != nil {
		handleError(c, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "password successfully changed", nil)
	c.JSON(http.StatusOK, res)
}

func (a *AuthController) Me(c *gin.Context) {
	val, exist := c.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	user, ok := val.(data.MeResponse)
	if ok {
		res := data.NewResponse(http.StatusOK, "berhasil mengambil data user", user)
		c.JSON(http.StatusOK, res)
		return
	}
	appErr := data.NewAppError(http.StatusBadRequest, "invalid user data", nil)
	res := data.NewResponseFromError(appErr)
	c.JSON(http.StatusBadRequest, res)
}
