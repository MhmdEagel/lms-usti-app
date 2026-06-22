package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type AuditLogRepository struct {
	Db *gorm.DB
}

type AuditLogRepositoryInterface interface {
	Create(log model.AuditLogs) error
	FindAll(pagination data.Pagination) (paginationResult *data.PaginationWithData, err error)
}

func NewAuditLogRepository(Db *gorm.DB) AuditLogRepositoryInterface {
	return &AuditLogRepository{Db: Db}
}

func (a *AuditLogRepository) Create(log model.AuditLogs) error {
	result := a.Db.Create(&log)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (a *AuditLogRepository) FindAll(pagination data.Pagination) (paginationResult *data.PaginationWithData, err error) {
	var logs []model.AuditLogs
	result := a.Db.Scopes(lib.Paginate(logs, &pagination, a.Db)).Order("created_at DESC").Find(&logs)
	if result.Error != nil {
		return paginationResult, result.Error
	}
	paginationResult = &data.PaginationWithData{
		Pagination: pagination,
		Data:       logs,
	}
	return paginationResult, nil
}
