package controllers

import (
	"log"
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

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