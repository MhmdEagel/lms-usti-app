package controllers

import (
	"log"
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
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
		msg := lib.GetValidationMessage(err.(validator.ValidationErrors))
		res := data.NewResponse(http.StatusBadRequest, msg, nil)
		c.JSON(http.StatusBadRequest, res)
		return
	}
	loginData, err := a.authService.Login(req)
	if err != nil {
		appErr, ok := err.(*data.AppError)
		if ok {
			res := data.NewResponseFromError(appErr)
			c.JSON(appErr.Code, res)
			return
		}
		log.Printf("Login: unexpected error: %v", err)
		appErr = data.NewAppError(http.StatusInternalServerError, "terjadi kesalahan server", err)
		res := data.NewResponseFromError(appErr)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "login success", loginData)
	c.JSON(http.StatusOK, res)
}

func (a *AuthController) Register(c *gin.Context) {
	var req data.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errMsg := lib.GetValidationMessage(err.(validator.ValidationErrors))
		res := data.NewResponse(http.StatusBadRequest, errMsg, nil)
		c.JSON(http.StatusBadRequest, res)
		return
	}
	if err := a.authService.Register(req); err != nil {
		appErr, ok := err.(*data.AppError)
		if ok {
			res := data.NewResponseFromError(appErr)
			c.JSON(appErr.Code, res)
			return
		}
		log.Printf("Register: unexpected error: %v", err)
		appErr = data.NewAppError(http.StatusInternalServerError, "terjadi kesalahan server", err)
		res := data.NewResponseFromError(appErr)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "register success", nil)
	c.JSON(http.StatusOK, res)
}

func (a *AuthController) ActivateUser(c *gin.Context) {
	var req data.VerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errMsg := lib.GetValidationMessage(err.(validator.ValidationErrors))
		res := data.NewResponse(http.StatusBadRequest, errMsg, nil)
		c.JSON(http.StatusBadRequest, res)
		return
	}
	err := a.authService.Activate(req)
	if err != nil {
		appErr, ok := err.(*data.AppError)
		if ok {
			res := data.NewResponseFromError(appErr)
			c.JSON(appErr.Code, res)
			return
		}
		log.Printf("ActivateUser: unexpected error: %v", err)
		appErr = data.NewAppError(http.StatusInternalServerError, "terjadi kesalahan server", err)
		res := data.NewResponseFromError(appErr)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "account successfully activated", nil)
	c.JSON(http.StatusOK, res)
}

func (a *AuthController) ResendActivation(c *gin.Context) {
	var req data.SendVerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errMsg := lib.GetValidationMessage(err.(validator.ValidationErrors))
		res := data.NewResponse(http.StatusBadRequest, errMsg, nil)
		c.JSON(http.StatusBadRequest, res)
		return
	}
	err := a.authService.SendVerificationEmail(req)
	if err != nil {
		appErr, ok := err.(*data.AppError)
		if ok {
			res := data.NewResponseFromError(appErr)
			c.JSON(appErr.Code, res)
			return
		}
		log.Printf("ResendActivation: unexpected error: %v", err)
		appErr = data.NewAppError(http.StatusInternalServerError, "terjadi kesalahan server", err)
		res := data.NewResponseFromError(appErr)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "email successfully sent", nil)
	c.JSON(http.StatusOK, res)
}

func (a *AuthController) SendResetPasswordEmail(c *gin.Context) {
	var req data.SendVerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errMsg := lib.GetValidationMessage(err.(validator.ValidationErrors))
		res := data.NewResponse(http.StatusBadRequest, errMsg, nil)
		c.JSON(http.StatusBadRequest, res)
		return
	}
	err := a.authService.SendVerificationEmail(req)
	if err != nil {
		appErr, ok := err.(*data.AppError)
		if ok {
			res := data.NewResponseFromError(appErr)
			c.JSON(appErr.Code, res)
			return
		}
		log.Printf("SendResetPasswordEmail: unexpected error: %v", err)
		appErr = data.NewAppError(http.StatusInternalServerError, "terjadi kesalahan server", err)
		res := data.NewResponseFromError(appErr)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "email successfully sent", nil)
	c.JSON(http.StatusOK, res)
}

func (a *AuthController) ResetPassword(c *gin.Context) {
	var req data.NewPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errMsg := lib.GetValidationMessage(err.(validator.ValidationErrors))
		res := data.NewResponse(http.StatusBadRequest, errMsg, nil)
		c.JSON(http.StatusBadRequest, res)
		return
	}

	err := a.authService.ResetPassword(req)
	if err != nil {
		appErr, ok := err.(*data.AppError)
		if ok {
			res := data.NewResponseFromError(appErr)
			c.JSON(appErr.Code, res)
			return
		}
		log.Printf("ResetPassword: unexpected error: %v", err)
		appErr = data.NewAppError(http.StatusInternalServerError, "terjadi kesalahan server", err)
		res := data.NewResponseFromError(appErr)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "password successfuly changed", nil)
	c.JSON(http.StatusOK, res)

}

func (a *AuthController) Me(c *gin.Context) {
	val, exist := c.Get("user")
	if !exist {
		res := data.NewResponse(http.StatusInternalServerError, "terjadi kesalahan", nil)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	user := val.(data.MeResponse)
	res := data.NewResponse(http.StatusOK, "berhasil mengambil data user", user)
	c.JSON(http.StatusOK, res)
}
