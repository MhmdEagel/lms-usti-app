package controllers

import (
	"net/http"
	"strconv"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
)

type MaterialController struct {
	materialService services.MaterialServiceInterface
}

func NewMaterialController(materialService services.MaterialServiceInterface) *MaterialController {
	return &MaterialController{materialService: materialService}
}

func (m *MaterialController) Create(c *gin.Context) {
	var req data.MaterialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bindJSONError(c, err)
		return
	}
	val, exist := c.Get("user")
	if !exist {
		handleError(c, data.ErrInternalServer(nil))
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		handleError(c, data.ErrInternalServer(nil))
		return
	}
	classroomId := c.Param("id")
	req.ClassroomId = classroomId
	req.DosenId = user.ID
	err := m.materialService.Create(req)
	if err != nil {
		handleError(c, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "material berhasil dibuat", nil)
	c.JSON(http.StatusOK, res)
}

func (m *MaterialController) FindAll(c *gin.Context) {
	id := c.Param("id")
	search := c.Query("search")
	limit, _ := strconv.Atoi(c.Query("limit"))
	page, _ := strconv.Atoi(c.Query("page"))

	pagination := data.Pagination{Limit: limit, Current: page}
	paginatedResult, err := m.materialService.FindAll(id, search, pagination)
	if err != nil {
		if appErr, ok := err.(*data.AppError); ok {
			res := data.NewResponseFromError(appErr)
			c.JSON(appErr.Code, res)
			return
		}
		handleError(c, err)
		return
	}
	res := data.NewPaginationResponse(http.StatusOK, "berhasil mengambil semua material", paginatedResult.Pagination, paginatedResult.Data)
	c.JSON(http.StatusOK, res)
}

func (m *MaterialController) FindById(c *gin.Context) {
	classroomId := c.Param("id")
	materialId := c.Param("materialId")
	val, exist := c.Get("user")
	if !exist {
		handleError(c, data.ErrInternalServer(nil))
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		handleError(c, data.ErrInternalServer(nil))
		return
	}
	material, err := m.materialService.FindById(materialId, classroomId, user.ID)
	if err != nil {
		handleError(c, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil material", material)
	c.JSON(http.StatusOK, res)
}

func (m *MaterialController) Update(c *gin.Context) {
	var req data.MaterialUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bindJSONError(c, err)
		return
	}
	classroomId := c.Param("id")
	materialId := c.Param("materialId")
	req.ClassroomId = classroomId
	req.Id = materialId
	err := m.materialService.Update(req)
	if err != nil {
		handleError(c, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "material berhasil diperbarui", nil)
	c.JSON(http.StatusOK, res)
}

func (m *MaterialController) Delete(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	materialId := ctx.Param("materialId")
	err := m.materialService.Delete(materialId, classroomId)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "material berhasil dihapus", nil)
	ctx.JSON(http.StatusOK, res)
}
