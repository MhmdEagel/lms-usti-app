package controllers

import (
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
)

type ForumController struct {
	forumService services.ForumServiceInterface
}

func NewForumController(forumService services.ForumServiceInterface) *ForumController {
	return &ForumController{forumService: forumService}
}

func (f *ForumController) CreatePost(ctx *gin.Context) {
	var req data.CreateForumPostRequest
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
	if err := f.forumService.CreatePost(req, user.UserId); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "postingan berhasil dibuat", nil)
	ctx.JSON(http.StatusOK, res)
}

func (f *ForumController) FindAllPosts(ctx *gin.Context) {
	posts, err := f.forumService.FindAllPosts()
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil postingan", posts)
	ctx.JSON(http.StatusOK, res)
}

func (f *ForumController) FindPostById(ctx *gin.Context) {
	postId := ctx.Param("postId")
	post, err := f.forumService.FindPostById(postId)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil postingan", post)
	ctx.JSON(http.StatusOK, res)
}

func (f *ForumController) DeletePost(ctx *gin.Context) {
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
	postId := ctx.Param("postId")
	if err := f.forumService.DeletePost(postId, user.UserId, user.Role); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "postingan berhasil dihapus", nil)
	ctx.JSON(http.StatusOK, res)
}
