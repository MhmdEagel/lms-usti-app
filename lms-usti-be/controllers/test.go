package controllers

import (
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/gin-gonic/gin"
)

func Test(c *gin.Context) {
	res := data.NewResponse(http.StatusOK, "Server is running", nil)
	c.JSON(http.StatusOK, res)

}
