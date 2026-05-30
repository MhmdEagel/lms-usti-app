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

func handleError(c *gin.Context, err error) {
	appErr, ok := err.(*data.AppError)
	if ok {
		res := data.NewResponseFromError(appErr)
		c.JSON(appErr.Code, res)
		return
	}
	log.Printf("unexpected error: %v", err)
	appErr = data.NewAppError(http.StatusInternalServerError, "terjadi kesalahan server", err)
	res := data.NewResponseFromError(appErr)
	c.JSON(http.StatusInternalServerError, res)
}

func bindJSONError(c *gin.Context, err error) {
	validationErrs, ok := err.(validator.ValidationErrors)
	if ok {
		msg := lib.GetValidationMessage(validationErrs)
		res := data.NewResponse(http.StatusBadRequest, msg, nil)
		c.JSON(http.StatusBadRequest, res)
		return
	}
	res := data.NewResponse(http.StatusBadRequest, "invalid request body", nil)
	c.JSON(http.StatusBadRequest, res)
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

func (a *AuthController) Register(c *gin.Context) {
	var req data.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bindJSONError(c, err)
		return
	}
	if err := a.authService.Register(req); err != nil {
		handleError(c, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "register success", nil)
	c.JSON(http.StatusOK, res)
}

func (a *AuthController) ActivateUser(c *gin.Context) {
	var req data.VerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bindJSONError(c, err)
		return
	}
	err := a.authService.Activate(req)
	if err != nil {
		handleError(c, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "account successfully activated", nil)
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
