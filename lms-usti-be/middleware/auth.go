package middleware

import (
	"net/http"
	"strings"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/gin-gonic/gin"
)

type AuthMiddleware struct{}

func NewAuthMiddleware() *AuthMiddleware {
	return &AuthMiddleware{}
}

func (a *AuthMiddleware) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" {
			appErr := data.NewAppError(http.StatusUnauthorized, "missing authorization header", nil)
			res := data.NewResponseFromError(appErr)
			c.AbortWithStatusJSON(appErr.Code, res)
			return
		}
		token := strings.SplitN(header, " ", 2)
		if len(token) != 2 || token[0] != "Bearer" {
			appErr := data.NewAppError(http.StatusUnauthorized, "unauthorized", nil)
			res := data.NewResponseFromError(appErr)
			c.AbortWithStatusJSON(appErr.Code, res)
			return
		}
		claims, err := lib.VerifyToken(token[1])
		if err != nil {
			appErr := data.NewAppError(http.StatusUnauthorized, "unauthorized", err)
			res := data.NewResponseFromError(appErr)
			c.AbortWithStatusJSON(appErr.Code, res)
			return
		}
		c.Set("user", data.MeResponse{Email: claims.Email, Role: claims.Role, UserId: claims.UserId, Fullname: claims.Fullname})
		c.Next()
	}
}

// func AuthDosenMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		val, exist := c.Get("user")
// 		if !exist {
// 			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan"})
// 			return
// 		}
// 		user := val.(model.Me)
// 		foundUser, err := model.GetUserByEmail(user.Email)
// 		if err != nil || foundUser.Role != "DOSEN" {
// 			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized."})
// 			c.Abort()
// 			return
// 		}
// 		c.Next()
// 	}
// }
// func AuthMahasiswaMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		val, exist := c.Get("user")
// 		if !exist {
// 			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan"})
// 			return
// 		}
// 		user := val.(model.Me)
// 		foundUser, err := model.GetUserByEmail(user.Email)
// 		if err != nil || foundUser.Role != "MAHASISWA" {
// 			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized."})
// 			c.Abort()
// 			return
// 		}
// 		c.Next()
// 	}
// }
