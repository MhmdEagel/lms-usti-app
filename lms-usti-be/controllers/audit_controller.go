package controllers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/gin-gonic/gin"
)

type AuditController struct {
	auditService services.AuditServiceInterface
}

func NewAuditController(auditService services.AuditServiceInterface) *AuditController {
	return &AuditController{auditService: auditService}
}

func (a *AuditController) FindAllLogs(ctx *gin.Context) {
	limit, _ := strconv.Atoi(ctx.Query("limit"))
	page, _ := strconv.Atoi(ctx.Query("page"))

	pagination := data.Pagination{Limit: limit, Current: page}
	paginationResult, err := a.auditService.GetAllLogs(pagination)
	if err != nil {
		log.Printf("FindAllLogs: %v", err)
		appErr := data.ErrInternalServer(nil)
		res := data.NewResponseFromError(appErr)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}
	res := data.NewPaginationResponse(http.StatusOK, "successfully find all audit logs", paginationResult.Pagination, paginationResult.Data)
	ctx.JSON(http.StatusOK, res)
}
