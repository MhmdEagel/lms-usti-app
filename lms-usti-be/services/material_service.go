package services

import (
	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
)

type MaterialService struct {
	materialRepository  repositories.MaterialRepositoryInterface
	classroomRepository repositories.ClassroomRepositoryInterface
}
type MaterialServiceInterface interface {
	Create(materialRequest data.MaterialRequest) error
	FindAll(classroomId string, search string, pagination data.Pagination) (paginatedResult *data.PaginationWithData, err error)
	FindById(materialId, classroomId string) (material data.MaterialDetailResponse, err error)
	Update(materialUpdateRequest data.MaterialUpdateRequest) error
	Delete(materialId, classroomId string) error
}

func NewMaterialService(materialRepository repositories.MaterialRepositoryInterface, classroomRepository repositories.ClassroomRepositoryInterface) MaterialServiceInterface {
	return &MaterialService{materialRepository: materialRepository, classroomRepository: classroomRepository}
}
func (m *MaterialService) Create(materialRequest data.MaterialRequest) error {
	classroom, err := m.classroomRepository.FindById(materialRequest.ClassroomId)
	if err != nil {
		return data.ErrClassroomNotFound(err)
	}
	material := &model.Material{
		Title:       materialRequest.Title,
		Description: materialRequest.Description,
		ClassroomId: classroom.ID,
		DosenId:     materialRequest.DosenId,
	}
	if err := m.materialRepository.Create(material); err != nil {
		return err
	}
	var attachments []model.MaterialAttachment
	for _, v := range materialRequest.Attachments {
		attType := model.AttachmentType(v.Type)
		if attType != model.AttachmentTypeFile && attType != model.AttachmentTypeLink {
			return data.ErrBadRequest(nil)
		}
		if attType == model.AttachmentTypeFile {
			if v.UniqueName == "" {
				return data.ErrBadRequest(nil)
			}
		}
		if attType == model.AttachmentTypeLink {
			if !lib.IsUrl(v.Url) {
				return data.ErrBadRequest(nil)
			}
		}
		attachment := model.MaterialAttachment{
			Name:       v.Name,
			Type:       attType,
			Url:        v.Url,
			UniqueName: v.UniqueName,
			MaterialId: material.ID,
		}
		attachments = append(attachments, attachment)
	}
	if len(attachments) > 0 {
		if err := m.materialRepository.CreateAttachments(attachments); err != nil {
			return err
		}
	}
	return nil
}
func (m *MaterialService) FindAll(classroomId string, search string, pagination data.Pagination) (paginatedResult *data.PaginationWithData, err error) {
	classroom, err := m.classroomRepository.FindById(classroomId)
	if err != nil {
		return nil, data.ErrClassroomNotFound(err)
	}
	paginatedResult, err = m.materialRepository.FindAll(classroom.ID, search, pagination)
	if err != nil {
		return nil, err
	}
	var materials []data.MaterialResponse
	for _, v := range paginatedResult.Data.([]model.Material) {
		material := data.MaterialResponse{
			Id:          v.ID,
			Title:       v.Title,
			Description: v.Description,
			CreatedAt:   v.CreatedAt.Format(time.RFC3339Nano),
			UpdatedAt:   v.UpdatedAt.Format(time.RFC3339Nano),
		}
		materials = append(materials, material)
	}
	paginatedResult.Data = materials
	return paginatedResult, nil
}
func (m *MaterialService) FindById(materialId, classroomId string) (material data.MaterialDetailResponse, err error) {
	classroom, err := m.classroomRepository.FindById(classroomId)
	if err != nil {
		return material, data.ErrClassroomNotFound(err)
	}
	res, err := m.materialRepository.FindById(materialId)
	if err != nil {
		return material, data.ErrMaterialNotFound(err)
	}
	material = data.MaterialDetailResponse{
		Id:          res.ID,
		Title:       res.Title,
		Description: res.Description,
		Classroom: data.ClassroomMeta{
			ClassroomId: classroom.ID,
			ClassroomName: classroom.ClassName,
		},
	}
	for _, v := range res.Attachments {
		attachment := data.AttachmentResponse{
			Id:         v.ID,
			Name:       v.Name,
			Type:       string(v.Type),
			Url:        v.Url,
			UniqueName: v.UniqueName,
		}
		material.Attachments = append(material.Attachments, attachment)
	}
	return material, nil
}
func (m *MaterialService) Update(materialUpdateRequest data.MaterialUpdateRequest) error {
	if _, err := m.classroomRepository.FindById(materialUpdateRequest.ClassroomId); err != nil {
		return data.ErrClassroomNotFound(err)
	}
	return m.materialRepository.Transaction(func(repo repositories.MaterialRepositoryInterface) error {
		material, err := repo.FindById(materialUpdateRequest.Id)
		if err != nil {
			return data.ErrMaterialNotFound(err)
		}
		material.Title = materialUpdateRequest.Title
		material.Description = materialUpdateRequest.Description

		if err := repo.Update(material); err != nil {
			return err
		}
		var updatedAttachments []model.MaterialAttachment
		for _, v := range materialUpdateRequest.Attachments {
			attType := model.AttachmentType(v.Type)
			if attType != model.AttachmentTypeFile && attType != model.AttachmentTypeLink {
				return data.ErrBadRequest(nil)
			}
			if attType == model.AttachmentTypeFile {
				if v.UniqueName == "" {
					return data.ErrBadRequest(nil)
				}
			}
			if attType == model.AttachmentTypeLink {
				if !lib.IsUrl(v.Url) {
					return data.ErrBadRequest(nil)
				}
			}
			attachment := model.MaterialAttachment{
				Name:       v.Name,
				Type:       attType,
				Url:        v.Url,
				UniqueName: v.UniqueName,
				MaterialId: material.ID,
			}
			updatedAttachments = append(updatedAttachments, attachment)
		}
		if err := repo.DeleteAttachments(material.ID); err != nil {
			return err
		}
		if len(updatedAttachments) > 0 {
			if err := repo.CreateAttachments(updatedAttachments); err != nil {
				return err
			}
		}
		return nil
	})
}

func (m *MaterialService) Delete(materialId, classroomId string) error {
	if _, err := m.classroomRepository.FindById(classroomId); err != nil {
		return data.ErrClassroomNotFound(err)
	}
	err := m.materialRepository.Delete(materialId, classroomId)
	if err != nil {
		return data.ErrMaterialNotFound(err)
	}
	return nil
}
