package middleware

import (
	"log"
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
				appErr, ok := err.Err.(*data.AppError)
				if ok {
					res := data.NewResponseFromError(appErr)
					ctx.AbortWithStatusJSON(appErr.Code, res)
					return
				}
				log.Printf("GlobalErr: unexpected error: %v", err.Err)
				res := data.NewResponse(http.StatusInternalServerError, "something went wrong", nil)
				ctx.AbortWithStatusJSON(http.StatusInternalServerError, res)
			}
		}
	}
}
