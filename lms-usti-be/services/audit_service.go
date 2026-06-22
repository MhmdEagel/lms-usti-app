package services

import (
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
)

type AuditService struct {
	auditLogRepository repositories.AuditLogRepositoryInterface
}

type AuditServiceInterface interface {
	LogAction(title string, description string, createdBy string) error
	GetAllLogs(pagination data.Pagination) (*data.PaginationWithData, error)
}

func NewAuditService(auditLogRepository repositories.AuditLogRepositoryInterface) AuditServiceInterface {
	return &AuditService{auditLogRepository: auditLogRepository}
}

func (a *AuditService) LogAction(title string, description string, createdBy string) error {
	log := model.AuditLogs{
		Title:       title,
		Description: description,
		CreatedBy:   createdBy,
	}
	return a.auditLogRepository.Create(log)
}

func (a *AuditService) GetAllLogs(pagination data.Pagination) (*data.PaginationWithData, error) {
	paginationRes, err := a.auditLogRepository.FindAll(pagination)
	if err != nil {
		return nil, err
	}
	return paginationRes, nil
}
