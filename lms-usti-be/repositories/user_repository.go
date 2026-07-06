package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type UserRepository struct {
	Db *gorm.DB
}

func NewUserRepository(Db *gorm.DB) UserRepositoryInterface {
	return &UserRepository{Db: Db}
}

type UserRepositoryInterface interface {
	Create(user model.User) error
	FindAll(pagination data.Pagination) (paginationResult *data.PaginationWithData, err error)
	FindById(userId string) (user model.User, err error)
	FindByEmail(email string) (user model.User, err error)
	Update(user model.User) error
	UpdatePassword(user model.User) error
	Delete(userId string) error
	FindAllClassrooms(userId string) (classrooms []model.Classroom, err error)
}

func (u *UserRepository) Create(user model.User) error {
	result := u.Db.Create(&user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (u *UserRepository) FindAll(pagination data.Pagination) (paginationResult *data.PaginationWithData, err error) {
	var users []model.User
	result := u.Db.Scopes(lib.Paginate(users, &pagination, u.Db)).Order("created_at DESC").Find(&users)
	if result.Error != nil {
		return paginationResult, result.Error
	}
	paginationResult = &data.PaginationWithData{
		Pagination: pagination,
		Data:       users,
	}
	return paginationResult, nil
}

func (u *UserRepository) FindById(userId string) (user model.User, err error) {
	result := u.Db.Where("id = ?", userId).First(&user)
	if result.Error != nil {
		return model.User{}, result.Error
	}
	return user, nil
}
func (u *UserRepository) FindByEmail(email string) (user model.User, err error) {
	result := u.Db.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return model.User{}, result.Error
	}
	return user, nil
}

func (u *UserRepository) UpdatePassword(user model.User) error {
	result := u.Db.Model(&model.User{}).Where("email = ?", user.Email).Update("password", user.Password)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (u *UserRepository) Update(user model.User) error {
	res := u.Db.Where("id = ?", user.ID).Model(&model.User{}).Updates(user)
	if res.Error != nil {
		return res.Error
	}
	return nil
}

func (u *UserRepository) Delete(userId string) error {
	result := u.Db.Where("id = ?", userId).Delete(&model.User{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (u *UserRepository) FindAllClassrooms(userId string) (classrooms []model.Classroom, err error) {
	var user model.User
	result := u.Db.Preload("MahasiswaClassrooms").Preload("MahasiswaClassrooms.Dosen").Find(&user, userId)
	if result.Error != nil {
		return []model.Classroom{}, result.Error
	}
	classrooms = user.MahasiswaClassrooms
	return classrooms, nil
}
