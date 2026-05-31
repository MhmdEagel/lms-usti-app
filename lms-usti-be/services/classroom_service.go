package services

import (
	"log"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"gorm.io/gorm"
)

type ClassroomService struct {
	classroomRepository repositories.ClassroomRepositoryInterface
	submissionService   SubmissionServiceInterface
	assignmentService   AssignmentServiceInterface
}

type ClassroomServiceInterface interface {
	Create(classroomRequest data.CreateClassroomRequest) error
	FindAllByDosenId(dosenId string, pagination data.Pagination) (paginationResult data.PaginationWithData, err error)
	FindAllByMahasiswaId(mahasiswaId string, pagination data.Pagination) (paginationResult data.PaginationWithData, err error)
	FindAllClassroomMember(classroomId string) (classroomMembers data.ClassroomMembersReponse, err error)
	FindById(classroomId string) (classroom data.ClassroomDetailResponse, err error)
	EnrollMahasiswa(joinClassroomRequest data.JoinClassroomRequest, mahasiswaId string) error
	Update(classroomUpdateRequest data.UpdateClassroomRequest) error
	Delete(classroomId string, userId string) error
}

func NewClassroomService(classroomRepository repositories.ClassroomRepositoryInterface, submissionService SubmissionServiceInterface, assignmentService AssignmentServiceInterface) ClassroomServiceInterface {
	return &ClassroomService{classroomRepository: classroomRepository, submissionService: submissionService, assignmentService: assignmentService}
}

func (c *ClassroomService) Create(classroomRequest data.CreateClassroomRequest) error {
	classroom := model.Classroom{
		ClassCover: classroomRequest.ClassCover,
		ClassName:  classroomRequest.ClassName,
		Term:       classroomRequest.Term,
		RoomNumber: classroomRequest.RoomNumber,
		Day:        classroomRequest.Day,
		ClassStart: classroomRequest.ClassStart,
		ClassEnd:   classroomRequest.ClassEnd,
		DosenId:    classroomRequest.DosenId,
	}
	return c.classroomRepository.Create(classroom)
}

func (c *ClassroomService) FindAllByDosenId(dosenId string, pagination data.Pagination) (paginationResult data.PaginationWithData, err error) {
	paginationRes, err := c.classroomRepository.FindAllByDosenId(dosenId, pagination)
	if err != nil {
		return paginationResult, err
	}

	var classrooms []data.ClassroomResponse
	for _, v := range paginationRes.Data.([]model.Classroom) {
		classroomResponse := data.ClassroomResponse{
			ID:         v.ID,
			ClassCover: v.ClassCover,
			ClassCode:  v.ClassCode,
			ClassName:  v.ClassName,
			Term:       v.Term,
			RoomNumber: v.RoomNumber,
			Day:        v.Day,
			ClassStart: v.ClassStart,
			ClassEnd:   v.ClassEnd,
			Dosen:      v.Dosen,
		}
		classrooms = append(classrooms, classroomResponse)
	}

	paginationRes.Data = classrooms
	return *paginationRes, nil
}
func (c *ClassroomService) FindAllByMahasiswaId(mahasiswaId string, pagination data.Pagination) (paginationResult data.PaginationWithData, err error) {
	paginationRes, err := c.classroomRepository.FindAllByMahasiswaId(mahasiswaId, pagination)
	if err != nil {
		return paginationResult, err
	}

	var classrooms []data.ClassroomResponse
	for _, v := range paginationRes.Data.([]model.Classroom) {
		classroomResponse := data.ClassroomResponse{
			ID:         v.ID,
			ClassCover: v.ClassCover,
			ClassCode:  v.ClassCode,
			ClassName:  v.ClassName,
			Term:       v.Term,
			RoomNumber: v.RoomNumber,
			Day:        v.Day,
			ClassStart: v.ClassStart,
			ClassEnd:   v.ClassEnd,
			Dosen:      v.Dosen,
		}
		classrooms = append(classrooms, classroomResponse)
	}

	paginationRes.Data = classrooms
	return *paginationRes, nil
}

func (c *ClassroomService) FindById(classroomId string) (classroom data.ClassroomDetailResponse, err error) {
	classroomData, err := c.classroomRepository.FindById(classroomId)
	if err != nil {
		return classroom, err
	}
	classroom = data.ClassroomDetailResponse{
		ID:         classroomData.ID,
		ClassCover: classroomData.ClassCover,
		ClassCode:  classroomData.ClassCode,
		ClassName:  classroomData.ClassName,
		Term:       classroomData.Term,
		RoomNumber: classroomData.RoomNumber,
		Day:        classroomData.Day,
		ClassStart: classroomData.ClassStart,
		ClassEnd:   classroomData.ClassEnd,
		Dosen:      classroomData.Dosen,
	}
	return classroom, nil
}

func (c *ClassroomService) FindAllClassroomMember(classroomId string) (classroomMembers data.ClassroomMembersReponse, err error) {
	classroom, err := c.classroomRepository.FindById(classroomId)
	if err != nil {
		return data.ClassroomMembersReponse{}, err
	}
	classroomMahasiswa, err := c.classroomRepository.FindAllClassroomMahasiswa(classroomId)
	if err != nil {
		return data.ClassroomMembersReponse{}, err
	}
	var classroomMahasiswaUsers []model.User
	for _, v := range classroomMahasiswa {
		classroomMahasiswaUsers = append(classroomMahasiswaUsers, v.User)
	}
	classroomMembers = data.ClassroomMembersReponse{
		Dosen:     classroom.Dosen,
		Mahasiswa: classroomMahasiswaUsers,
	}
	return classroomMembers, nil
}

func (c *ClassroomService) EnrollMahasiswa(joinClassroomRequest data.JoinClassroomRequest, mahasiswaId string) error {
	classroom, err := c.classroomRepository.FindByClassCode(joinClassroomRequest.ClassCode)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return data.ErrClassroomNotFound(nil)
		}
		log.Printf("EnrollMahasiswa: %s", err.Error())
		return data.NewAppError(500, "terjadi kesalahan", nil)
	}
	classroomMahasiswa := model.ClassroomMahasiswa{
		ClassroomId: classroom.ID,
		UserId:      mahasiswaId,
	}
	isAlreadyEnrolled := c.classroomRepository.IsAlreadyEnroll(classroomMahasiswa)
	if isAlreadyEnrolled {
		return data.ErrAlreadyEnrolled(nil)
	}
	isSubmissionAlreadyCreated := c.submissionService.IsAlreadyCreated(mahasiswaId)
	if !isSubmissionAlreadyCreated {
		assignments, _ := c.assignmentService.FindAll(classroom.ID)
		if len(assignments) > 0 {
			for _, assignment := range assignments {
				submission := data.SubmissionRequest{
					Status:         "not_submitted",
					SubmissionDate: nil,
					StudentId:      mahasiswaId,
					AssignmentId:   assignment.ID,
				}
				err := c.submissionService.Create([]data.SubmissionRequest{submission})
				if err != nil {
					return err
				}
			}
		}
	}
	if err := c.classroomRepository.Enroll(classroomMahasiswa); err != nil {
		return err
	}
	return nil
}
func (c *ClassroomService) Update(classroomUpdateRequest data.UpdateClassroomRequest) error {
	classroom, err := c.classroomRepository.FindById(classroomUpdateRequest.Id)
	if err != nil {
		return err
	}
	if classroomUpdateRequest.ClassName != nil {
		classroom.ClassName = *classroomUpdateRequest.ClassName
	}
	if classroomUpdateRequest.ClassCover != nil {
		classroom.ClassCover = *classroomUpdateRequest.ClassCover
	}
	if classroomUpdateRequest.Term != nil {
		classroom.Term = *classroomUpdateRequest.Term
	}
	if classroomUpdateRequest.RoomNumber != nil {
		classroom.RoomNumber = *classroomUpdateRequest.RoomNumber
	}
	if classroomUpdateRequest.Day != nil {
		classroom.Day = *classroomUpdateRequest.Day
	}
	if classroomUpdateRequest.ClassStart != nil {
		classroom.ClassStart = *classroomUpdateRequest.ClassStart
	}
	if classroomUpdateRequest.ClassEnd != nil {
		classroom.ClassEnd = *classroomUpdateRequest.ClassEnd
	}
	if err := c.classroomRepository.Update(classroom); err != nil {
		return err
	}

	return nil
}

func (c *ClassroomService) Delete(classroomId string, userId string) error {
	err := c.classroomRepository.Delete(classroomId, userId)
	if err != nil {
		return err
	}
	return nil
}
