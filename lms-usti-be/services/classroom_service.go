package services

import (
	"errors"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"google.golang.org/api/drive/v3"
)

type ClassroomService struct {
	classroomRepository repositories.ClassroomRepositoryInterface
	submissionService   SubmissionServiceInterface
	assignmentService   AssignmentServiceInterface
	driveService        *drive.Service
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
	classroom := model.Classroom{ClassCover: classroomRequest.ClassCover, ClassName: classroomRequest.ClassName, Term: classroomRequest.Term, RoomNumber: classroomRequest.RoomNumber, Day: classroomRequest.Day, ClassStart: classroomRequest.ClassStart, ClassEnd: classroomRequest.ClassEnd, DosenId: classroomRequest.DosenId}
	err := c.classroomRepository.Create(classroom)
	if err != nil {
		return err
	}
	return nil
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
		return err
	}
	classroomMahasiswa := model.ClassroomMahasiswa{
		ClassroomId: classroom.ID,
		UserId:      mahasiswaId,
	}
	isAllreadyEnroll := c.classroomRepository.IsAlreadyEnroll(classroomMahasiswa)
	if isAllreadyEnroll {
		return errors.New("already join the class")
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
	classroom.ClassName = classroomUpdateRequest.ClassName
	classroom.ClassCover = classroomUpdateRequest.ClassCover
	classroom.Term = classroomUpdateRequest.Term
	classroom.RoomNumber = classroomUpdateRequest.RoomNumber
	classroom.Day = classroomUpdateRequest.Day
	classroom.ClassStart = classroomUpdateRequest.ClassStart
	classroom.ClassEnd = classroomUpdateRequest.ClassEnd
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
