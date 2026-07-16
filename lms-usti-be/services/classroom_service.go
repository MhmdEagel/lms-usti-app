package services

import (
	"log"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"gorm.io/gorm"
)

type ClassroomService struct {
	classroomRepository       repositories.ClassroomRepositoryInterface
	userRepository            repositories.UserRepositoryInterface
	submissionService         SubmissionServiceInterface
	assignmentService         AssignmentServiceInterface
	classroomPolicyRepository repositories.ClassroomPolicyRepositoryInterface
}

type ClassroomServiceInterface interface {
	Create(classroomRequest data.CreateClassroomRequest) error
	FindAllByDosenId(dosenId string, filter data.ClassroomFilter, pagination data.Pagination) (paginationResult data.PaginationWithData, err error)
	FindAllByMahasiswaId(mahasiswaId string, filter data.ClassroomFilter, pagination data.Pagination) (paginationResult data.PaginationWithData, err error)
	FindAllClassroomMember(classroomId string) (classroomMembers data.ClassroomMembersReponse, err error)
	FindClassroomMemberByMemberId(classroomId, memberId string) (classroomMember data.ClassroomMemberDetailResponse, err error)
	FindById(classroomId string) (classroom data.ClassroomDetailResponse, err error)
	EnrollMahasiswa(joinClassroomRequest data.JoinClassroomRequest, mahasiswaId string) error
	RemoveMember(classroomId, memberId string) error
	Update(classroomUpdateRequest data.UpdateClassroomRequest) error
	Delete(classroomId string, userID string) error
	Archive(classroomId string, userID string) error
	Unarchive(classroomId string, userID string) error
	GetClassroomGrades(classroomId string) (data.ClassroomGradesResponse, error)
	GetMyGrades(classroomId string, studentId string) (data.StudentGradesResponse, error)
	GetDashboardStats(dosenId string) (data.DashboardStatsResponse, error)
	GetMahasiswaDashboardStats(mahasiswaId string) (data.MahasiswaDashboardStatsResponse, error)
}

func NewClassroomService(classroomRepository repositories.ClassroomRepositoryInterface,
	userRepository repositories.UserRepositoryInterface, submissionService SubmissionServiceInterface, assignmentService AssignmentServiceInterface, classroomPolicyRepository repositories.ClassroomPolicyRepositoryInterface) ClassroomServiceInterface {
	return &ClassroomService{classroomRepository: classroomRepository, userRepository: userRepository, submissionService: submissionService, assignmentService: assignmentService, classroomPolicyRepository: classroomPolicyRepository}
}

func (c *ClassroomService) Create(classroomRequest data.CreateClassroomRequest) error {
	return c.classroomRepository.Transaction(func(repo repositories.ClassroomRepositoryInterface) error {
		classroom := model.Classroom{
			ClassCover:  classroomRequest.ClassCover,
			ClassName:   classroomRequest.ClassName,
			Term:        classroomRequest.Term,
			RoomNumber:  classroomRequest.RoomNumber,
			Day:         classroomRequest.Day,
			ClassStart:  classroomRequest.ClassStart,
			ClassEnd:    classroomRequest.ClassEnd,
			Prodi:       classroomRequest.Prodi,
			TahunAjaran: classroomRequest.TahunAjaran,
			DosenId:     classroomRequest.DosenId,
		}
		created, err := repo.Create(classroom)
		if err != nil {
			return err
		}
		policy := model.ClassroomPolicy{
			ClassroomID:       created.ID,
			ForumPermission:   model.ForumPermissionComment,
			CommentPermission: model.CommentPermissionActive,
		}
		return repo.DB().Create(&policy).Error
	})
}

func (c *ClassroomService) FindAllByDosenId(dosenId string, filter data.ClassroomFilter, pagination data.Pagination) (paginationResult data.PaginationWithData, err error) {
	paginationRes, err := c.classroomRepository.FindAllByDosenId(dosenId, filter, pagination)
	if err != nil {
		return paginationResult, err
	}

	var classrooms []data.ClassroomResponse
	for _, v := range paginationRes.Data.([]model.Classroom) {
		classroomResponse := data.ClassroomResponse{
			ID:          v.ID,
			ClassCover:  v.ClassCover,
			ClassCode:   v.ClassCode,
			ClassName:   v.ClassName,
			Term:        v.Term,
			RoomNumber:  v.RoomNumber,
			Day:         v.Day,
			ClassStart:  v.ClassStart,
			ClassEnd:    v.ClassEnd,
			Prodi:       v.Prodi,
			TahunAjaran: v.TahunAjaran,
			IsArchived:  v.IsArchived,
			Dosen:       v.Dosen,
		}
		classrooms = append(classrooms, classroomResponse)
	}

	paginationRes.Data = classrooms
	return *paginationRes, nil
}
func (c *ClassroomService) FindAllByMahasiswaId(mahasiswaId string, filter data.ClassroomFilter, pagination data.Pagination) (paginationResult data.PaginationWithData, err error) {
	paginationRes, err := c.classroomRepository.FindAllByMahasiswaId(mahasiswaId, filter, pagination)
	if err != nil {
		return paginationResult, err
	}

	var classrooms []data.ClassroomResponse
	for _, v := range paginationRes.Data.([]model.Classroom) {
		classroomResponse := data.ClassroomResponse{
			ID:          v.ID,
			ClassCover:  v.ClassCover,
			ClassCode:   v.ClassCode,
			ClassName:   v.ClassName,
			Term:        v.Term,
			RoomNumber:  v.RoomNumber,
			Day:         v.Day,
			ClassStart:  v.ClassStart,
			ClassEnd:    v.ClassEnd,
			Prodi:       v.Prodi,
			TahunAjaran: v.TahunAjaran,
			Dosen:       v.Dosen,
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
		ID:          classroomData.ID,
		ClassCover:  classroomData.ClassCover,
		ClassCode:   classroomData.ClassCode,
		ClassName:   classroomData.ClassName,
		Term:        classroomData.Term,
		RoomNumber:  classroomData.RoomNumber,
		Day:         classroomData.Day,
		ClassStart:  classroomData.ClassStart,
		ClassEnd:    classroomData.ClassEnd,
		Prodi:       classroomData.Prodi,
		TahunAjaran: classroomData.TahunAjaran,
		IsArchived:  classroomData.IsArchived,
		Dosen:       classroomData.Dosen,
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

func (c *ClassroomService) FindClassroomMemberByMemberId(classroomId, memberId string) (classroomMemberDetailRes data.ClassroomMemberDetailResponse, err error) {
	classroom, err := c.classroomRepository.FindById(classroomId)
	if err != nil {
		return data.ClassroomMemberDetailResponse{}, err
	}
	user, err := c.userRepository.FindById(memberId)
	if err != nil {
		return data.ClassroomMemberDetailResponse{}, err
	}
	return data.ClassroomMemberDetailResponse{ClassName: classroom.ClassName, Member: user}, nil
}

func (c *ClassroomService) EnrollMahasiswa(joinClassroomRequest data.JoinClassroomRequest, mahasiswaId string) error {
	classroom, err := c.classroomRepository.FindByClassCode(joinClassroomRequest.ClassCode)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return data.ErrClassroomNotFound(nil)
		}
		log.Printf("EnrollMahasiswa: %s", err.Error())
		return data.NewAppError(500, "terjadi kesalahan", err)
	}
	if classroom.IsArchived {
		return data.ErrClassroomArchived(nil)
	}

	classroomMahasiswa := model.ClassroomMahasiswa{
		ClassroomId: classroom.ID,
		UserId:      mahasiswaId,
	}
	isAlreadyEnrolled := c.classroomRepository.IsAlreadyEnroll(classroomMahasiswa)
	if isAlreadyEnrolled {
		return data.ErrAlreadyEnrolled(nil)
	}
	isSubmissionAlreadyCreated := c.submissionService.IsAlreadyCreated(mahasiswaId, classroom.ID)
	if !isSubmissionAlreadyCreated {
		assignmentsPagination := data.Pagination{Limit: 9999, Current: 1}
		paginatedResult, err := c.assignmentService.FindAll(classroom.ID, "", assignmentsPagination)
		if err != nil {
			log.Printf("EnrollMahasiswa: failed to find assignments: %v", err)
			return data.NewAppError(500, "terjadi kesalahan server", err)
		}
		assignments := paginatedResult.Data.([]data.AssignmentResponse)
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
func (c *ClassroomService) RemoveMember(classroomId, memberId string) error {
	if _, err := c.classroomRepository.FindById(classroomId); err != nil {
		return err
	}
	if _, err := c.userRepository.FindById(memberId); err != nil {
		return err
	}
	if err := c.classroomRepository.RemoveMember(classroomId, memberId); err != nil {
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
	if classroomUpdateRequest.Prodi != nil {
		classroom.Prodi = *classroomUpdateRequest.Prodi
	}
	if classroomUpdateRequest.TahunAjaran != nil {
		classroom.TahunAjaran = *classroomUpdateRequest.TahunAjaran
	}
	return c.classroomRepository.Update(classroom)
}

func (c *ClassroomService) Delete(classroomId string, userID string) error {
	return c.classroomRepository.Delete(classroomId, userID)

}

func (c *ClassroomService) Archive(classroomId string, userID string) error {
	return c.classroomRepository.Archive(classroomId, userID)
}

func (c *ClassroomService) Unarchive(classroomId string, userID string) error {
	return c.classroomRepository.Unarchive(classroomId, userID)
}

func (c *ClassroomService) GetClassroomGrades(classroomId string) (data.ClassroomGradesResponse, error) {
	submissions, assignments, err := c.submissionService.GetClassroomGrades(classroomId)
	if err != nil {
		return data.ClassroomGradesResponse{}, err
	}

	gradeAssignments := make([]data.ClassroomGradeAssignment, len(assignments))
	for i, a := range assignments {
		gradeAssignments[i] = data.ClassroomGradeAssignment{ID: a.ID, Title: a.Title}
	}

	studentMap := make(map[string]*data.ClassroomGradeStudent)
	var studentOrder []string

	for _, sub := range submissions {
		studentID := sub.StudentId
		student, ok := studentMap[studentID]
		if !ok {
			fullname := sub.User.Fullname
			student = &data.ClassroomGradeStudent{
				ID:       studentID,
				Fullname: fullname,
				Grades:   make(map[string]*float64),
			}
			studentMap[studentID] = student
			studentOrder = append(studentOrder, studentID)
		}
		student.Grades[sub.AssignmentId] = sub.Score
	}

	students := make([]data.ClassroomGradeStudent, len(studentOrder))
	for i, id := range studentOrder {
		students[i] = *studentMap[id]
	}

	averages := make(map[string]float64)
	var totalSum float64
	var totalCount int

	for _, a := range assignments {
		var sum float64
		var count int
		for _, s := range students {
			if score, ok := s.Grades[a.ID]; ok && score != nil {
				sum += *score
				count++
			}
		}
		if count > 0 {
			avg := sum / float64(count)
			averages[a.ID] = avg
			totalSum += avg
			totalCount++
		}
	}

	var overallAverage float64
	if totalCount > 0 {
		overallAverage = totalSum / float64(totalCount)
	}

	return data.ClassroomGradesResponse{
		Assignments:    gradeAssignments,
		Students:       students,
		Averages:       averages,
		OverallAverage: overallAverage,
	}, nil
}

func (c *ClassroomService) GetMyGrades(classroomId string, studentId string) (data.StudentGradesResponse, error) {
	assignments, submissions, err := c.submissionService.GetStudentGrades(classroomId, studentId)
	if err != nil {
		return data.StudentGradesResponse{}, err
	}

	subMap := make(map[string]model.Submission)
	for _, sub := range submissions {
		subMap[sub.AssignmentId] = sub
	}

	var totalScore float64
	var gradedCount int
	gradeAssignments := make([]data.StudentGradeAssignment, len(assignments))

	for i, a := range assignments {
		item := data.StudentGradeAssignment{
			ID:    a.ID,
			Title: a.Title,
		}
		if a.Deadline.Valid {
			t := a.Deadline.Time.Format("2006-01-02T15:04:05Z")
			item.Deadline = &t
		}

		if sub, ok := subMap[a.ID]; ok {
			if sub.Score != nil {
				item.Score = sub.Score
				item.Status = "graded"
				totalScore += *sub.Score
				gradedCount++
			} else {
				item.Status = "submitted"
			}
		} else {
			item.Status = "not_submitted"
		}

		gradeAssignments[i] = item
	}

	var average *float64
	if gradedCount > 0 {
		avg := totalScore / float64(gradedCount)
		average = &avg
	}

	return data.StudentGradesResponse{
		Assignments: gradeAssignments,
		Average:     average,
	}, nil
}

func (c *ClassroomService) GetMahasiswaDashboardStats(mahasiswaId string) (data.MahasiswaDashboardStatsResponse, error) {
	return c.classroomRepository.GetMahasiswaDashboardStats(mahasiswaId)
}

func (c *ClassroomService) GetDashboardStats(dosenId string) (data.DashboardStatsResponse, error) {
	return c.classroomRepository.GetDashboardStats(dosenId)
}
