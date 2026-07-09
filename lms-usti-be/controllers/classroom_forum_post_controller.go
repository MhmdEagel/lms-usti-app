package controllers

import (
	"net/http"
	"strconv"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
)

type ClassroomForumPostController struct {
	classroomForumPostService services.ClassroomForumPostServiceInterface
}

func NewClassroomForumPostController(classroomForumPostService services.ClassroomForumPostServiceInterface) *ClassroomForumPostController {
	return &ClassroomForumPostController{classroomForumPostService: classroomForumPostService}
}

func (c *ClassroomForumPostController) FindAll(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	search := ctx.Query("search")
	pagination := data.Pagination{Current: page, Limit: limit}
	paginatedResult, err := c.classroomForumPostService.FindAll(classroomId, search, pagination)
	if err != nil {
		if appErr, ok := err.(*data.AppError); ok {
			res := data.NewResponseFromError(appErr)
			ctx.JSON(appErr.Code, res)
			return
		}
		handleError(ctx, err)
		return
	}
	res := data.NewPaginationResponse(http.StatusOK, "berhasil mengambil semua forum post", paginatedResult.Pagination, paginatedResult.Data)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomForumPostController) Create(ctx *gin.Context) {
	var req data.ClassroomForumPostRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	val, exist := ctx.Get("user")
	if !exist {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	user, ok := val.(data.MeResponse)
	if !ok {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	classroomId := ctx.Param("id")
	req.ClassroomId = classroomId
	req.DosenId = user.ID
	err := c.classroomForumPostService.Create(req, user.Role)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "forum post berhasil dibuat", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomForumPostController) FindById(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	forumPostId := ctx.Param("announcementId")
	forumPost, err := c.classroomForumPostService.FindById(forumPostId, classroomId)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil detail forum post", forumPost)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomForumPostController) Update(ctx *gin.Context) {
	var req data.ClassroomForumPostUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}
	classroomId := ctx.Param("id")
	forumPostId := ctx.Param("announcementId")
	err := c.classroomForumPostService.Update(forumPostId, classroomId, req)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "forum post berhasil diperbarui", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *ClassroomForumPostController) Delete(ctx *gin.Context) {
	classroomId := ctx.Param("id")
	forumPostId := ctx.Param("announcementId")
	err := c.classroomForumPostService.Delete(forumPostId, classroomId)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "forum post berhasil dihapus", nil)
	ctx.JSON(http.StatusOK, res)
}
