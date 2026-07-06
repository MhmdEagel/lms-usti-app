package controllers

import (
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
)

type CommentController struct {
	commentService services.CommentServiceInterface
}

func NewCommentController(commentService services.CommentServiceInterface) *CommentController {
	return &CommentController{commentService: commentService}
}

func (c *CommentController) detectCommentableType(ctx *gin.Context) (string, string) {
	if ctx.Param("materialId") != "" {
		return model.CommentableTypeMaterial, ctx.Param("materialId")
	}
	if ctx.Param("assignmentId") != "" {
		return model.CommentableTypeAssignment, ctx.Param("assignmentId")
	}
	if ctx.Param("announcementId") != "" {
		return model.CommentableTypeAnnouncement, ctx.Param("announcementId")
	}
	if ctx.Param("postId") != "" {
		return model.CommentableTypeForumPost, ctx.Param("postId")
	}
	return "", ""
}

func (c *CommentController) FindAll(ctx *gin.Context) {
	commentableType, commentableId := c.detectCommentableType(ctx)
	if commentableType == "" {
		handleError(ctx, data.ErrBadRequest(nil))
		return
	}
	comments, err := c.commentService.FindAll(commentableType, commentableId)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil komentar", comments)
	ctx.JSON(http.StatusOK, res)
}

func (c *CommentController) Create(ctx *gin.Context) {
	var req data.CommentRequest
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
	commentableType, commentableId := c.detectCommentableType(ctx)
	if commentableType == "" {
		handleError(ctx, data.ErrBadRequest(nil))
		return
	}
	classroomId := ctx.Param("id")
	if err := c.commentService.Create(req, commentableType, commentableId, user.ID, classroomId, user.Role); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "komentar berhasil dibuat", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *CommentController) Delete(ctx *gin.Context) {
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
	commentId := ctx.Param("commentId")
	if user.Role == "PRODI" {
		if err := c.commentService.DeleteByID(commentId); err != nil {
			handleError(ctx, err)
			return
		}
	} else {
		if err := c.commentService.Delete(commentId, user.ID); err != nil {
			handleError(ctx, err)
			return
		}
	}
	res := data.NewResponse(http.StatusOK, "komentar berhasil dihapus", nil)
	ctx.JSON(http.StatusOK, res)
}
