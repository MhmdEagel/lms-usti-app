package services

import (
	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
)

type MaterialService struct {
	materialRepository    repositories.MaterialRepositoryInterface
	classroomRepository   repositories.ClassroomRepositoryInterface
	contentViewRepository repositories.ContentViewRepositoryInterface
}
type MaterialServiceInterface interface {
	Create(materialRequest data.MaterialRequest) error
	FindAll(classroomId string, search string, pagination data.Pagination, meetingId ...string) (paginatedResult *data.PaginationWithData, err error)
	FindById(materialId, classroomId, userID string) (material data.MaterialDetailResponse, err error)
	Update(materialUpdateRequest data.MaterialUpdateRequest) error
	Delete(materialId, classroomId string) error
	GetViewers(materialId, classroomId string) ([]data.ViewerResponse, error)
}

func NewMaterialService(materialRepository repositories.MaterialRepositoryInterface, classroomRepository repositories.ClassroomRepositoryInterface, contentViewRepository repositories.ContentViewRepositoryInterface) MaterialServiceInterface {
	return &MaterialService{materialRepository: materialRepository, classroomRepository: classroomRepository, contentViewRepository: contentViewRepository}
}
func (m *MaterialService) Create(materialRequest data.MaterialRequest) error {
	classroom, err := m.classroomRepository.FindById(materialRequest.ClassroomId)
	if err != nil {
		return data.ErrClassroomNotFound(err)
	}
	material := &model.Material{
		Title:       materialRequest.Title,
		Description: materialRequest.Description,
		MeetingId:   materialRequest.MeetingId,
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
func (m *MaterialService) FindAll(classroomId string, search string, pagination data.Pagination, meetingId ...string) (paginatedResult *data.PaginationWithData, err error) {
	classroom, err := m.classroomRepository.FindById(classroomId)
	if err != nil {
		return nil, data.ErrClassroomNotFound(err)
	}
	meetingIdStr := ""
	if len(meetingId) > 0 {
		meetingIdStr = meetingId[0]
	}
	paginatedResult, err = m.materialRepository.FindAll(classroom.ID, search, meetingIdStr, pagination)
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
func (m *MaterialService) FindById(materialId, classroomId, userID string) (material data.MaterialDetailResponse, err error) {
	classroom, err := m.classroomRepository.FindById(classroomId)
	if err != nil {
		return material, data.ErrClassroomNotFound(err)
	}
	res, err := m.materialRepository.FindById(materialId)
	if err != nil {
		return material, data.ErrMaterialNotFound(err)
	}
	_, err = m.contentViewRepository.TryRecordView(userID, model.ViewableTypeMaterial, materialId)
	if err != nil {
		return material, data.ErrInternalServer(err)
	}
	material = data.MaterialDetailResponse{
		Id:          res.ID,
		Title:       res.Title,
		Description: res.Description,
		MeetingId:   res.MeetingId,
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
		material.MeetingId = materialUpdateRequest.MeetingId

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

func (m *MaterialService) GetViewers(materialId, classroomId string) ([]data.ViewerResponse, error) {
	if _, err := m.classroomRepository.FindById(classroomId); err != nil {
		return nil, data.ErrClassroomNotFound(err)
	}
	if _, err := m.materialRepository.FindById(materialId); err != nil {
		return nil, data.ErrMaterialNotFound(err)
	}
	users, err := m.contentViewRepository.GetViewersByContent(model.ViewableTypeMaterial, materialId)
	if err != nil {
		return nil, data.ErrInternalServer(err)
	}
	viewers := make([]data.ViewerResponse, len(users))
	for i, u := range users {
		viewers[i] = data.ViewerResponse{
			ID:       u.ID,
			Fullname: u.Fullname,
			Profile:  u.Image,
			Role:     u.Role,
		}
	}
	return viewers, nil
}
