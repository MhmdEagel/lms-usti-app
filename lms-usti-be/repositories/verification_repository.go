package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type VerificationRepository struct {
	Db *gorm.DB
}
type VerificationRepositoryInterface interface {
	Create(verification model.VerificationToken) error
	FindByEmail(email string) (verificationToken model.VerificationToken, err error)
	FindByToken(token string) (verificationToken model.VerificationToken, err error)
	FindByEmailAndToken(email string, token string) (verificationToken model.VerificationToken, err error)
	DeleteByEmail(email string) error
}

func NewVerificationRepository(Db *gorm.DB) VerificationRepositoryInterface {
	return &VerificationRepository{Db: Db}
}

func (v *VerificationRepository) Create(verification model.VerificationToken) (err error) {
	result := v.Db.Create(&verification)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (v *VerificationRepository) FindByEmail(email string) (verificationToken model.VerificationToken, err error) {
	result := v.Db.Where("email = ?", email).First(&verificationToken)
	if result.Error != nil {
		return model.VerificationToken{}, result.Error
	}
	return verificationToken, nil
}

func (v *VerificationRepository) FindByToken(token string) (verificationToken model.VerificationToken, err error) {
	result := v.Db.Where("token = ?", token).First(&verificationToken)
	if result.Error != nil {
		return model.VerificationToken{}, result.Error
	}
	return verificationToken, nil
}

func (v *VerificationRepository) FindByEmailAndToken(email string, token string) (verificationToken model.VerificationToken, err error) {
	result := v.Db.Where("email = ? AND token = ?", email, token).First(&verificationToken)
	if result.Error != nil {
		return model.VerificationToken{}, result.Error
	}
	return verificationToken, nil
}

func (v *VerificationRepository) DeleteByEmail(email string) error {
	result := v.Db.Where("email = ?", email).Delete(&model.VerificationToken{})
	if result.Error != nil {
		return result.Error
	}
	return nil
}
