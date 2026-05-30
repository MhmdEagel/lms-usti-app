package controllers

import (
	"errors"
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
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
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusBadRequest, "email or password incorrect", nil)
			c.JSON(http.StatusBadRequest, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		c.JSON(http.StatusBadRequest, res)
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
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
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
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
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
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
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
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
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
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
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
