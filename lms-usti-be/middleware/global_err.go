package middleware

import (
	"net/http"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/gin-gonic/gin"
)

type GlobalErrMiddleware struct{}

func NewGlobalErrMiddleware() *GlobalErrMiddleware {
	return &GlobalErrMiddleware{}
}

func (g *GlobalErrMiddleware) Handle() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Next()
		if len(ctx.Errors) > 0 {
			err := ctx.Errors.Last()
			if err != nil {
				res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
				ctx.AbortWithStatusJSON(http.StatusInternalServerError, res)
				ctx.Abort()
			}
		}
	}
}
