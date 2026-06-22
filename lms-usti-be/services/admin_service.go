package services

import (
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"gorm.io/gorm"
)

type AdminService struct {
	userRepository         repositories.UserRepositoryInterface
	verificationRepository repositories.VerificationRepositoryInterface
	auditService           AuditServiceInterface
}

type AdminServiceInterface interface {
	CreateUser(req data.RegisterRequest) error
	FindAllUsers(pagination data.Pagination) (paginationResult data.PaginationWithData, err error)
	FindUserById(userId string) (*data.MeResponse, error)
	UpdateUser(req data.UpdateUserReq) error
	DeleteUser(userId string) error
	SendVerificationEmail(req data.SendVerificationRequest) error
}

func NewAdminService(userRepository repositories.UserRepositoryInterface, verificationRepository repositories.VerificationRepositoryInterface, auditService AuditServiceInterface) AdminServiceInterface {
	return &AdminService{userRepository: userRepository, verificationRepository: verificationRepository, auditService: auditService}
}

func (a *AdminService) CreateUser(req data.RegisterRequest) error {
	hashedPassword, err := lib.HashPassword(req.Password)
	if err != nil {
		log.Printf("Register: failed to hash password: %v", err)
		return data.NewAppError(500, "terjadi kesalahan server", err)
	}
	user := model.User{
		Fullname: req.Fullname,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     req.Role,
	}
	if err := a.userRepository.Create(user); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) || strings.Contains(err.Error(), "UNIQUE constraint") {
			log.Printf("Register: duplicate email %s: %v", req.Email, err)
			return data.ErrEmailAlreadyExist(err)
		}
		log.Printf("Register: failed to create user: %v", err)
		return data.NewAppError(500, "terjadi kesalahan server", err)
	}
	a.auditService.LogAction(
		"Penambahan User",
		fmt.Sprintf("Menambahkan user baru: %s, %s", req.Fullname, req.Email),
	)
	return nil
}

func (a *AdminService) FindAllUsers(pagination data.Pagination) (paginationResult data.PaginationWithData, err error) {
	paginationRes, err := a.userRepository.FindAll(pagination)
	if err != nil {
		return paginationResult, err
	}

	var users []data.MeResponse
	for _, v := range paginationRes.Data.([]model.User) {
		userResponse := data.MeResponse{
			UserId:   v.ID,
			Email:    v.Email,
			Role:     v.Role,
			Fullname: v.Fullname,
		}
		users = append(users, userResponse)
	}
	paginationRes.Data = users
	return *paginationRes, nil
}


func (a *AdminService) UpdateUser(req data.UpdateUserReq) error {
	user, err := a.userRepository.FindById(req.UserId)
	if err != nil {
		return err
	}
	if req.Fullname != nil {
		user.Fullname = *req.Fullname
	}
	if req.Email != nil {
		user.Email = *req.Email
	}
	if req.Role != nil {
		user.Role = *req.Role
	}
	err = a.userRepository.Update(user)
	if err != nil {
		return err
	}
	a.auditService.LogAction(
		"Pengubahan User",
		fmt.Sprintf("Mengubah data user: %s (%s)", user.Fullname, user.Email),
	)
	return nil
}
func (a *AdminService) FindUserById(userId string) (*data.MeResponse, error) {
	user, err := a.userRepository.FindById(userId)
	if err != nil {
		return nil, err
	}
	res := &data.MeResponse{
		UserId:   user.ID,
		Email:    user.Email,
		Role:     user.Role,
		Fullname: user.Fullname,
	}
	return res, nil
}

func (a *AdminService) DeleteUser(userId string) error {
	user, err := a.userRepository.FindById(userId)
	if err != nil {
		return err
	}
	a.auditService.LogAction(
		"Penghapusan User",
		fmt.Sprintf("Menghapus user: %s (%s)", user.Fullname, user.Email),
	)
	return a.userRepository.Delete(userId)
}

func (a *AdminService) SendVerificationEmail(req data.SendVerificationRequest) error {
	user, err := a.userRepository.FindByEmail(req.Email)
	if err != nil {
		if err != gorm.ErrRecordNotFound {
			log.Printf("SendVerificationEmail: %s", err.Error())
			return data.NewAppError(500, "terjadi kesalahan", nil)
		}
		log.Printf("SendVerificationEmail: user not found for email %s: %v", req.Email, err)
		return data.ErrEmailNotFound(err)
	}
	verificationToken := model.NewVerificationToken(user.Email)
	if err := a.verificationRepository.Create(verificationToken); err != nil {
		log.Printf("SendVerificationEmail: failed to create token: %v", err)
		return data.NewAppError(500, "terjadi kesalahan server", err)
	}
	if err := lib.SendVerificationEmail(user.Email, verificationToken.Token); err != nil {
		log.Printf("SendVerificationEmail: failed to send email: %v", err)
		return data.NewAppError(500, "gagal mengirim email", err)
	}
	return nil
}
