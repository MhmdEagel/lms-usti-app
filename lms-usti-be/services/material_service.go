package services

import (
	"fmt"
	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"gorm.io/gorm"
)
type MaterialService struct {
	materialRepository  repositories.MaterialRepositoryInterface
	classroomRepository repositories.ClassroomRepositoryInterface
}
type MaterialServiceInterface interface {
	Create(materialRequest data.MaterialRequest) error
	FindAll(classroomId string) (materials []data.MaterialResponse, err error)
	FindById(materialId, classroomId string) (material data.MaterialDetailResponse, err error)
	Update(materialUpdateRequest data.MaterialUpdateRequest) error
	Delete(materialId string) error
}
func NewMaterialService(materialRepository repositories.MaterialRepositoryInterface, classroomRepository repositories.ClassroomRepositoryInterface) MaterialServiceInterface {
	return &MaterialService{materialRepository: materialRepository, classroomRepository: classroomRepository}
}
func (m *MaterialService) Create(materialRequest data.MaterialRequest) error {
	classroom, err := m.classroomRepository.FindById(materialRequest.ClassroomId)
	if err != nil {
		return err
	}
	material := &model.Material{
		Title:       materialRequest.Title,
		Description: materialRequest.Description,
		ClassroomId: classroom.ID,
	}
	if err := m.materialRepository.Create(material); err != nil {
		return err
	}
	fmt.Println(material)
	var materialLinks []model.MaterialLink
	for _, v := range materialRequest.Links {
		materialLink := model.MaterialLink{
			LinkName:   v.LinkName,
			LinkUrl:    v.LinkUrl,
			MaterialId: material.ID,
		}
		materialLinks = append(materialLinks, materialLink)
	}
	if len(materialLinks) > 0 {
		if err := m.materialRepository.CreateMaterialLink(materialLinks); err != nil {
			return err
		}
	}

	var materialFiles []model.MaterialFile
	for _, f := range materialRequest.Files {
		materialFile := model.MaterialFile{
			FileName:       f.FileName,
			FileUrl:        f.FileUrl,
			UniqueFileName: f.UniqueFileName,
			MaterialId:     material.ID,
		}
		materialFiles = append(materialFiles, materialFile)
	}
	if len(materialFiles) > 0 {
		if err := m.materialRepository.CreateMaterialFile(materialFiles); err != nil {
			return err
		}
	}
	return nil
}
func (m *MaterialService) FindAll(classroomId string) (materials []data.MaterialResponse, err error) {
	classroom, err := m.classroomRepository.FindById(classroomId)
	if err != nil {
		return []data.MaterialResponse{}, err
	}
	res, err := m.materialRepository.FindAll(classroom.ID)
	if err != nil {
		return []data.MaterialResponse{}, err
	}
	for _, v := range res {
		material := data.MaterialResponse{
			Id:          v.ID,
			Title:       v.Title,
			Description: v.Description,
			CreatedAt:   v.CreatedAt.Format(time.RFC3339Nano),
			UpdatedAt:   v.UpdatedAt.Format(time.RFC3339Nano),
		}
		materials = append(materials, material)
	}

	return materials, nil
}
func (m *MaterialService) FindById(materialId, classroomId string) (material data.MaterialDetailResponse, err error) {
	if _, err := m.classroomRepository.FindById(classroomId); err != nil {
		return material, err
	}
	res, err := m.materialRepository.FindById(materialId)
	if err != nil {
		return material, err
	}
	if res.ClassroomId != classroomId {
		return material, gorm.ErrRecordNotFound
	}
	material = data.MaterialDetailResponse{
		Id:          res.ID,
		Title:       res.Title,
		Description: res.Description,
	}
	for _, vFile := range res.MaterialFiles {
		file := data.FileResponse{
			Id:             vFile.ID,
			FileName:       vFile.FileName,
			FileUrl:        vFile.FileUrl,
			UniqueFileName: vFile.UniqueFileName,
		}
		material.Files = append(material.Files, file)
	}
	for _, vLink := range res.MaterialLinks {
		link := data.LinkResponse{
			Id:       vLink.ID,
			LinkName: vLink.LinkName,
			LinkUrl:  vLink.LinkUrl,
		}
		material.Links = append(material.Links, link)
	}
	return material, nil
}
func (m *MaterialService) Update(materialUpdateRequest data.MaterialUpdateRequest) error {
	if _, err := m.classroomRepository.FindById(materialUpdateRequest.ClassroomId); err != nil {
		return err
	}
	return m.materialRepository.Transaction(func(repo repositories.MaterialRepositoryInterface) error {
		material, err := repo.FindById(materialUpdateRequest.Id)
		if err != nil {
			return err
		}
		material.Title = materialUpdateRequest.Title
		material.Description = materialUpdateRequest.Description

		if err := repo.Update(material); err != nil {
			return err
		}
		var updatedLinks []model.MaterialLink
		for _, v := range materialUpdateRequest.Links {
			link := model.MaterialLink{
				ID:         v.Id,
				LinkName:   v.LinkName,
				LinkUrl:    v.LinkUrl,
				MaterialId: material.ID,
			}
			updatedLinks = append(updatedLinks, link)
		}
		if err := repo.DeleteLinks(material.ID); err != nil {
			return err
		}
		if len(updatedLinks) > 0 {
			if err := repo.CreateMaterialLink(updatedLinks); err != nil {
				return err
			}
		}
		var updatedFiles []model.MaterialFile
		for _, v := range materialUpdateRequest.Files {
			file := model.MaterialFile{
				ID:         v.Id,
				FileName:   v.FileName,
				FileUrl:    v.FileUrl,
				MaterialId: material.ID,
			}
			updatedFiles = append(updatedFiles, file)
		}
		if err := repo.DeleteFiles(material.ID); err != nil {
			return err
		}
		if len(updatedFiles) > 0 {
			if err := repo.CreateMaterialFile(updatedFiles); err != nil {
				return err
			}
		}
		return nil
	})
}
func (m *MaterialService) Delete(materialId string) error {
	err := m.materialRepository.Delete(materialId)
	if err != nil {
		return err
	}
	return nil
}

