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

func (a *AuthController) UpdateProfile(c *gin.Context) {
	userId := getUserId(c)
	if userId == "" {
		appErr := data.NewAppError(http.StatusUnauthorized, "unauthorized", nil)
		res := data.NewResponseFromError(appErr)
		c.JSON(http.StatusUnauthorized, res)
		return
	}
	var req data.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bindJSONError(c, err)
		return
	}
	err := a.authService.UpdateProfile(userId, req)
	if err != nil {
		appErr := data.NewAppError(http.StatusInternalServerError, "gagal mengupdate profil", err)
		res := data.NewResponseFromError(appErr)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "profil berhasil diperbarui", nil)
	c.JSON(http.StatusOK, res)
}

func (a *AuthController) Me(c *gin.Context) {
	val, exist := c.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	userClaim, ok := val.(data.MeResponse)
	if !ok {
		appErr := data.NewAppError(http.StatusBadRequest, "invalid user data", nil)
		res := data.NewResponseFromError(appErr)
		c.JSON(http.StatusBadRequest, res)
		return
	}
	user, err := a.authService.GetUserById(userClaim.UserId)
	if err != nil {
		appErr := data.NewAppError(http.StatusInternalServerError, "gagal mengambil data user", err)
		res := data.NewResponseFromError(appErr)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil data user", user)
	c.JSON(http.StatusOK, res)
}
