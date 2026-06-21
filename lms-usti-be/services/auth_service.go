package services

import (
	"log"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"gorm.io/gorm"
)

type AuthService struct {
	userRepository         repositories.UserRepositoryInterface
	verificationRepository repositories.VerificationRepositoryInterface
}

func NewAuthService(userRepository repositories.UserRepositoryInterface, verificationRepository repositories.VerificationRepositoryInterface) AuthServiceInterface {
	return &AuthService{userRepository: userRepository, verificationRepository: verificationRepository}
}
type AuthServiceInterface interface {
	Login(loginRequest data.LoginRequest) (loginResponse data.LoginResponse, err error)
	SendVerificationEmail(req data.SendVerificationRequest) error
	ResetPassword(req data.NewPasswordRequest) error
}
func (a *AuthService) Login(loginRequest data.LoginRequest) (loginResponse data.LoginResponse, err error) {
	user, err := a.userRepository.FindByEmail(loginRequest.Email)
	if err != nil {
		if err != gorm.ErrRecordNotFound {
			log.Printf("Login: %s", err.Error())
			return data.LoginResponse{}, data.NewAppError(500, "terjadi kesalahan", nil)
		}
		log.Printf("Login: user not found by email %s: %v", loginRequest.Email, err)
		return data.LoginResponse{}, data.ErrInvalidCredentials(nil)
	}
	if !lib.IsPasswordMatch(user.Password, loginRequest.Password) {
		log.Printf("Login: password mismatch for email %s", loginRequest.Email)
		return data.LoginResponse{}, data.ErrInvalidCredentials(nil)
	}
	token, err := lib.CreateToken(user.Fullname, user.Email, user.Role, user.ID)
	if err != nil {
		log.Printf("Login: failed to create token: %v", err)
		return data.LoginResponse{}, data.NewAppError(500, "gagal membuat token", err)
	}
	return data.LoginResponse{
		AccessToken: token,
		TokenType:   "Bearer",
		ExpiresIn:   86400,
	}, nil
}

func (a *AuthService) ResetPassword(req data.NewPasswordRequest) error {
	verificationToken, err := a.verificationRepository.FindByToken(req.Token)
	if err != nil {
		log.Printf("ResetPassword: token not found: %v", err)
		return data.ErrInvalidToken(err)
	}
	if lib.IsTokenVerificationExpired(&verificationToken.Expires) {
		log.Printf("ResetPassword: token expired for email %s", verificationToken.Email)
		return data.ErrTokenExpired(nil)
	}
	user, err := a.userRepository.FindByEmail(verificationToken.Email)
	if err != nil {
		if err != gorm.ErrRecordNotFound {
			log.Printf("ResetPassword: %s", err.Error())
			return data.NewAppError(500, "terjadi kesalahan", nil)
		}
		log.Printf("ResetPassword: user not found for email %s: %v", verificationToken.Email, err)
		return data.NewAppError(404, "email tidak ditemukan", err)
	}
	if !lib.IsPasswordMatch(user.Password, req.OldPassword) {
		log.Printf("ResetPassword: password mismatch for email %s", verificationToken.Email)
		return data.ErrInvalidCredentials(nil)
	}
	newPassword, err := lib.HashPassword(req.NewPassword)
	if err != nil {
		log.Printf("ResetPassword: failed to hash password: %v", err)
		return data.NewAppError(500, "terjadi kesalahan server", err)
	}
	user.Password = newPassword
	if err := a.userRepository.UpdatePassword(user); err != nil {
		log.Printf("ResetPassword: failed to update password: %v", err)
		return data.NewAppError(500, "terjadi kesalahan server", err)
	}
	return nil
}
func (a *AuthService) SendVerificationEmail(req data.SendVerificationRequest) error {
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
