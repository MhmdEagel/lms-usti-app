package services

import (
	"database/sql"
	"errors"
	"time"

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
	Register(registerRequest data.RegisterRequest) error
	Login(loginRequest data.LoginRequest) (loginResponse data.LoginResponse, err error)
	Activate(verificationRequest data.VerificationRequest) error
	SendVerificationEmail(req data.SendVerificationRequest) error
	ResetPassword(req data.NewPasswordRequest) error
}

func (a *AuthService) Register(registerRequest data.RegisterRequest) error {
	user := model.User{
		Fullname: registerRequest.Fullname,
		Email:    registerRequest.Email,
		Password: lib.HashPassword(registerRequest.Password),
		Role:     registerRequest.Role,
	}
	if err := a.userRepository.Create(user); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return errors.New("email already exist, check inbox for verification or resend email activation")
		}
		return err
	}
	if err := a.SendVerificationEmail(data.SendVerificationRequest{Email: registerRequest.Email}); err != nil {
		return err
	}
	return nil
}

func (a *AuthService) Login(loginRequest data.LoginRequest) (loginResponse data.LoginResponse, err error) {
	user, err := a.userRepository.FindByEmail(loginRequest.Email)
	if err != nil {
		return data.LoginResponse{}, err
	}
	if !lib.IsPasswordMatch(user.Password, loginRequest.Password) {
		return data.LoginResponse{}, errors.New("invalid credentials")
	}
	token, err := lib.CreateToken(user.Fullname, user.Email, user.Role, user.ID)
	if err != nil {
		return data.LoginResponse{}, err
	}
	return data.LoginResponse{
		AccessToken: token,
		TokenType:   "Bearer",
		ExpiresIn:   86400,
	}, nil
}

func (a *AuthService) Activate(req data.VerificationRequest) error {
	verificationToken, err := a.verificationRepository.FindByToken(req.Token)
	if err != nil {
		return err
	}
	if lib.IsTokenVerificationExpired(&verificationToken.Expires) {
		return errors.New("token is expired")
	}

	user, err := a.userRepository.FindByEmail(verificationToken.Email)
	if err != nil {
		return err
	}
	verifyTime := sql.NullTime{
		Time:  time.Now(),
		Valid: true,
	}
	user.EmailVerified = verifyTime
	if err := a.userRepository.UpdateVerification(user); err != nil {
		return err
	}
	return nil
}

func (a *AuthService) ResetPassword(req data.NewPasswordRequest) error {
	verificationToken, err := a.verificationRepository.FindByToken(req.Token)
	if err != nil {
		return err
	}
	if lib.IsTokenVerificationExpired(&verificationToken.Expires) {
		return errors.New("token is expired")
	}
	user, err := a.userRepository.FindByEmail(verificationToken.Email)
	if err != nil {
		return err
	}
	if !lib.IsPasswordMatch(user.Password, req.OldPassword) {
		return errors.New("invalid credentials")
	}
	newPassword := lib.HashPassword(req.NewPassword)
	user.Password = newPassword
	if err := a.userRepository.UpdatePassword(user); err != nil {
		return err
	}
	return nil
}

func (a *AuthService) SendVerificationEmail(req data.SendVerificationRequest) error {
	user, err := a.userRepository.FindByEmail(req.Email)
	if err != nil {
		return errors.New("email not found")
	}
	verificationToken := model.NewVerificationToken(user.Email)
	if err := a.verificationRepository.Create(verificationToken); err != nil {
		return err
	}

	if err := lib.SendVerificationEmail(user.Email, verificationToken.Token); err != nil {
		return errors.New("email not sent")
	}
	return nil
}
