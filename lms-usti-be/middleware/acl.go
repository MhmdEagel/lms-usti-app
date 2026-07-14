package middleware

import (
	"net/http"
	"slices"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/gin-gonic/gin"
)

type AclMiddleware struct{}

func NewAclMiddleware() *AclMiddleware {
	return &AclMiddleware{}
}

func (a *AclMiddleware) Handle(roles []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		val, exist := c.Get("user")
		if !exist {
			res := data.NewResponse(http.StatusUnauthorized, "unauthorized", nil)
			c.AbortWithStatusJSON(http.StatusUnauthorized, res)
			return
		}
		user := val.(data.MeResponse)
		if !slices.Contains(roles, user.Role) {
			res := data.NewResponse(http.StatusForbidden, "forbidden", nil)
			c.AbortWithStatusJSON(http.StatusForbidden, res)
			return
		}
		c.Next()
	}
}
