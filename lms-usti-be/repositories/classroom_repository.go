package repositories

import (
	"strconv"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type ClassroomRepository struct {
	Db *gorm.DB
}

type ClassroomRepositoryInterface interface {
	Create(classroom model.Classroom) (model.Classroom, error)
	FindById(classroomId string) (classroom model.Classroom, err error)
	FindByClassCode(classCode string) (classroom model.Classroom, err error)
	FindAllByDosenId(dosenId string, filter data.ClassroomFilter, pagination data.Pagination) (paginationResult *data.PaginationWithData, err error)
	FindAllByMahasiswaId(mahasiswaId string, filter data.ClassroomFilter, pagination data.Pagination) (paginationResult *data.PaginationWithData, err error)
	Update(classroom model.Classroom) error
	Delete(classroomId string, dosenId string) error
	Enroll(classroomMahasiswa model.ClassroomMahasiswa) error
	IsAlreadyEnroll(classroomMahasiswa model.ClassroomMahasiswa) bool
	FindAllClassroomMahasiswa(classroomId string) (mahasiswa []model.ClassroomMahasiswa, err error)
	RemoveMember(classroomId string, memberId string) error
	GetDashboardStats(dosenId string) (data.DashboardStatsResponse, error)
	GetMahasiswaDashboardStats(mahasiswaId string) (data.MahasiswaDashboardStatsResponse, error)
	Transaction(fn func(repo ClassroomRepositoryInterface) error) error
	DB() *gorm.DB
}

func NewClassroomRepository(Db *gorm.DB) ClassroomRepositoryInterface {
	return &ClassroomRepository{Db: Db}
}
func (c *ClassroomRepository) Create(classroom model.Classroom) (model.Classroom, error) {
	result := c.Db.Create(&classroom)
	if result.Error != nil {
		return model.Classroom{}, result.Error
	}
	return classroom, nil
}
func (u *ClassroomRepository) FindById(classroomId string) (classroom model.Classroom, err error) {
	result := u.Db.Preload("Dosen").Where("id = ?", classroomId).First(&classroom)
	if result.Error != nil {
		return model.Classroom{}, result.Error
	}
	return classroom, nil
}
func (u *ClassroomRepository) FindByClassCode(classCode string) (classroom model.Classroom, err error) {
	result := u.Db.Preload("Dosen").Where("class_code = ?", classCode).First(&classroom)
	if result.Error != nil {

		return model.Classroom{}, result.Error
	}
	return classroom, nil
}
func (u *ClassroomRepository) FindAllByDosenId(dosenId string, filter data.ClassroomFilter, pagination data.Pagination) (paginationResult *data.PaginationWithData, err error) {
	var classrooms []model.Classroom
	query := u.Db.Scopes(lib.Paginate(classrooms, &pagination, u.Db)).Preload("Dosen").Where("dosen_id = ?", dosenId)
	if filter.Search != "" {
		query = query.Where("class_name LIKE ?", "%"+filter.Search+"%")
	}
	if filter.Prodi != "" {
		query = query.Where("prodi = ?", filter.Prodi)
	}
	if filter.Term != "" {
		term, err := strconv.Atoi(filter.Term)
		if err == nil {
			query = query.Where("term = ?", term)
		}
	}
	if filter.TahunAjaran != "" {
		query = query.Where("tahun_ajaran = ?", filter.TahunAjaran)
	}
	if filter.RoomNumber != "" {
		roomNumber, err := strconv.Atoi(filter.RoomNumber)
		if err == nil {
			query = query.Where("room_number = ?", roomNumber)
		}
	}
	result := query.Find(&classrooms)
	if result.Error != nil {
		return paginationResult, result.Error
	}
	paginationResult = &data.PaginationWithData{
		Pagination: pagination,
		Data:       classrooms,
	}
	return paginationResult, nil
}

func (u *ClassroomRepository) FindAllByMahasiswaId(mahasiswaId string, filter data.ClassroomFilter, pagination data.Pagination) (paginationResult *data.PaginationWithData, err error) {
	var classrooms []model.Classroom
	var classroomMahasiswa []model.ClassroomMahasiswa
	query := u.Db.Scopes(lib.Paginate(classroomMahasiswa, &pagination, u.Db)).Preload("Classroom").Preload("Classroom.Dosen").Where("user_id = ?", mahasiswaId)
	joinsAdded := false
	addJoin := func() {
		if !joinsAdded {
			query = query.Joins("JOIN classrooms ON classrooms.id = classroom_mahasiswas.classroom_id")
			joinsAdded = true
		}
	}
	if filter.Search != "" {
		addJoin()
		query = query.Where("classrooms.class_name LIKE ?", "%"+filter.Search+"%")
	}
	if filter.Prodi != "" {
		addJoin()
		query = query.Where("classrooms.prodi = ?", filter.Prodi)
	}
	if filter.Term != "" {
		addJoin()
		term, err := strconv.Atoi(filter.Term)
		if err == nil {
			query = query.Where("classrooms.term = ?", term)
		}
	}
	if filter.TahunAjaran != "" {
		addJoin()
		query = query.Where("classrooms.tahun_ajaran = ?", filter.TahunAjaran)
	}
	if filter.RoomNumber != "" {
		addJoin()
		roomNumber, err := strconv.Atoi(filter.RoomNumber)
		if err == nil {
			query = query.Where("classrooms.room_number = ?", roomNumber)
		}
	}
	result := query.Find(&classroomMahasiswa)
	if result.Error != nil {
		return paginationResult, result.Error
	}
	for _, v := range classroomMahasiswa {
		classrooms = append(classrooms, v.Classroom)
	}
	paginationResult = &data.PaginationWithData{
		Pagination: pagination,
		Data:       classrooms,
	}
	return paginationResult, nil
}

func (u *ClassroomRepository) FindAllClassroomMahasiswa(classroomId string) (mahasiswa []model.ClassroomMahasiswa, err error) {
	result := u.Db.Where("classroom_id = ?", classroomId).Preload("User").Find(&mahasiswa)
	if result.Error != nil {
		return []model.ClassroomMahasiswa{}, result.Error
	}
	return mahasiswa, nil
}

func (u *ClassroomRepository) Update(classroom model.Classroom) error {
	res := u.Db.Where("id = ?", classroom.ID).Model(&model.Classroom{}).Updates(classroom)
	if res.Error != nil {
		return res.Error
	}
	return nil
}

func (c *ClassroomRepository) Enroll(classroomMahasiswa model.ClassroomMahasiswa) error {
	result := c.Db.Create(&classroomMahasiswa)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (c *ClassroomRepository) IsAlreadyEnroll(classroomMahasiswa model.ClassroomMahasiswa) bool {
	var count int64
	c.Db.Model(&model.ClassroomMahasiswa{}).Where("user_id = ? AND classroom_id = ?", classroomMahasiswa.UserId, classroomMahasiswa.ClassroomId).Count(&count)
	return count > 0
}

func (c *ClassroomRepository) RemoveMember(classroomId, memberId string) error {
	return c.Db.Transaction(func(tx *gorm.DB) error {
		res := tx.Where("user_id = ? AND classroom_id = ?", memberId, classroomId).Delete(model.ClassroomMahasiswa{})
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}
		if err := tx.Where("student_id = ? AND assignment_id IN (SELECT id FROM assignments WHERE classroom_id = ?)", memberId, classroomId).Delete(model.Submission{}).Error; err != nil {
			return err
		}
		return nil
	})
}

func (c *ClassroomRepository) Delete(classroomId string, dosenId string) error {
	classroom, err := c.FindById(classroomId)
	if err != nil {
		return err
	}
	res := c.Db.Where("dosen_id = ? AND id = ? ", dosenId, classroom.ID).Delete(model.Classroom{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (c *ClassroomRepository) GetMahasiswaDashboardStats(mahasiswaId string) (data.MahasiswaDashboardStatsResponse, error) {
	result := data.MahasiswaDashboardStatsResponse{
		UpcomingAssignments: []data.MahasiswaAssignmentItem{},
	}

	rows, err := c.Db.Raw(`
		SELECT
			a.id AS assignment_id,
			a.title AS assignment_title,
			a.classroom_id,
			c.class_name AS classroom_name,
			a.deadline,
			CASE
				WHEN a.deadline IS NULL THEN NULL
				ELSE DATEDIFF(a.deadline, NOW())
			END AS days_remaining
		FROM assignments a
		JOIN classrooms c ON c.id = a.classroom_id
		JOIN classroom_mahasiswas cm ON cm.classroom_id = a.classroom_id
		LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = cm.user_id
		WHERE cm.user_id = ?
		  AND (s.id IS NULL OR s.status = 'not_submitted')
	`, mahasiswaId).Rows()
	if err != nil {
		return result, err
	}
	defer rows.Close()

	for rows.Next() {
		var item data.MahasiswaAssignmentItem
		var deadline *string
		var daysRemaining *int
		if err := rows.Scan(&item.AssignmentID, &item.AssignmentTitle, &item.ClassroomID, &item.ClassroomName, &deadline, &daysRemaining); err != nil {
			return result, err
		}
		item.Deadline = deadline
		item.DaysRemaining = daysRemaining

		result.UpcomingAssignments = append(result.UpcomingAssignments, item)
	}

	return result, nil
}

func (c *ClassroomRepository) GetDashboardStats(dosenId string) (data.DashboardStatsResponse, error) {
	var stats data.DashboardStatsResponse

	if err := c.Db.Model(&model.Classroom{}).Where("dosen_id = ?", dosenId).Count(&stats.TotalClassrooms).Error; err != nil {
		return stats, err
	}

	if err := c.Db.Model(&model.ClassroomMahasiswa{}).
		Joins("JOIN classrooms ON classrooms.id = classroom_mahasiswas.classroom_id").
		Where("classrooms.dosen_id = ?", dosenId).
		Distinct("classroom_mahasiswas.user_id").
		Count(&stats.TotalStudents).Error; err != nil {
		return stats, err
	}

	if err := c.Db.Model(&model.Assignment{}).
		Joins("JOIN classrooms ON classrooms.id = assignments.classroom_id").
		Where("classrooms.dosen_id = ?", dosenId).
		Count(&stats.TotalAssignments).Error; err != nil {
		return stats, err
	}

	return stats, nil
}

func (c *ClassroomRepository) withTx(tx *gorm.DB) ClassroomRepositoryInterface {
	return &ClassroomRepository{Db: tx}
}

func (c *ClassroomRepository) Transaction(fn func(repo ClassroomRepositoryInterface) error) error {
	tx := c.Db.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	repo := c.withTx(tx)
	err := fn(repo)
	if err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
}

func (c *ClassroomRepository) DB() *gorm.DB {
	return c.Db
}
