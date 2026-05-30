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

type MaterialController struct {
	materialService services.MaterialServiceInterface
}

func NewMaterialController(materialService services.MaterialServiceInterface) *MaterialController {
	return &MaterialController{materialService: materialService}
}

func (m *MaterialController) Create(c *gin.Context) {
	var req data.MaterialRequest
	if err := c.ShouldBind(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			msg := lib.GetValidationMessage(ve)
			res := data.NewResponse(http.StatusBadRequest, msg, nil)
			c.JSON(http.StatusBadRequest, res)
			return
		}
		res := data.NewResponse(http.StatusBadRequest, err.Error(), nil)
		c.JSON(http.StatusBadRequest, res)
		return
	}
	classroomId := c.Param("id")
	req.ClassroomId = classroomId
	err := m.materialService.Create(req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			c.JSON(http.StatusNotFound, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "material successfully created", nil)
	c.JSON(http.StatusOK, res)
}

func (m *MaterialController) FindAll(c *gin.Context) {
	id := c.Param("id")
	materials, err := m.materialService.FindAll(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom not found", nil)
			c.JSON(http.StatusNotFound, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success find all materials", materials)
	c.JSON(http.StatusOK, res)
}

func (m *MaterialController) FindById(c *gin.Context) {
	classroomId := c.Param("id")
	materialId := c.Param("materialId")
	material, err := m.materialService.FindById(materialId, classroomId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom or material not found", nil)
			c.JSON(http.StatusNotFound, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "success find material by id", material)
	c.JSON(http.StatusOK, res)
}

func (m *MaterialController) Update(c *gin.Context) {
	var req data.MaterialUpdateRequest
	if err := c.ShouldBind(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			msg := lib.GetValidationMessage(ve)
			res := data.NewResponse(http.StatusBadRequest, msg, nil)
			c.JSON(http.StatusBadRequest, res)
			return
		}
		res := data.NewResponse(http.StatusBadRequest, err.Error(), nil)
		c.JSON(http.StatusBadRequest, res)
		return
	}
	classroomId := c.Param("id")
	materialId := c.Param("materialId")
	req.ClassroomId = classroomId
	req.Id = materialId
	err := m.materialService.Update(req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "classroom or material not found", nil)
			c.JSON(http.StatusNotFound, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		c.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewResponse(http.StatusOK, "material successfully updated", nil)
	c.JSON(http.StatusOK, res)
}

func (m *MaterialController) Delete(ctx *gin.Context) {
	materialId := ctx.Param("materialId")
	err := m.materialService.Delete(materialId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			res := data.NewResponse(http.StatusNotFound, "material not found", nil)
			ctx.JSON(http.StatusNotFound, res)
			return
		}
		res := data.NewResponse(http.StatusInternalServerError, err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := data.NewResponse(http.StatusOK, "material successfully deleted", nil)
	ctx.JSON(http.StatusOK, res)
}
