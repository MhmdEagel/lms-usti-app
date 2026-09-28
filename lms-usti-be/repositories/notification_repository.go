package repositories

import (
	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/MhmdEagel/lms-usti-be/model"
	"gorm.io/gorm"
)

type NotificationRepository struct {
	Db *gorm.DB
}

type NotificationRepositoryInterface interface {
	CreateBulk(notifications []model.Notification) error
	FindAllByUserId(userId string, pagination data.Pagination) (result *data.PaginationWithData, err error)
	CountUnread(userId string) (int64, error)
	MarkAsRead(id string, userId string) error
	MarkAllAsRead(userId string) error
	FindUserIdsByRoles(roles []string) ([]string, error)
}

func NewNotificationRepository(Db *gorm.DB) NotificationRepositoryInterface {
	return &NotificationRepository{Db: Db}
}

func (n *NotificationRepository) CreateBulk(notifications []model.Notification) error {
	if len(notifications) == 0 {
		return nil
	}
	return n.Db.Create(&notifications).Error
}

func (n *NotificationRepository) FindAllByUserId(userId string, pagination data.Pagination) (result *data.PaginationWithData, err error) {
	var notifications []model.Notification
	result = &data.PaginationWithData{Pagination: pagination}
	query := n.Db.Where("user_id = ?", userId).Order("created_at DESC")
	if err := query.Scopes(lib.Paginate(notifications, &pagination, query)).Find(&notifications).Error; err != nil {
		return nil, err
	}
	result.Data = notifications
	result.Pagination = pagination
	return result, nil
}

func (n *NotificationRepository) CountUnread(userId string) (int64, error) {
	var total int64
	err := n.Db.Model(&model.Notification{}).Where("user_id = ? AND is_read = ?", userId, false).Count(&total).Error
	return total, err
}

func (n *NotificationRepository) MarkAsRead(id string, userId string) error {
	res := n.Db.Model(&model.Notification{}).Where("id = ? AND user_id = ?", id, userId).Update("is_read", true)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (n *NotificationRepository) MarkAllAsRead(userId string) error {
	return n.Db.Model(&model.Notification{}).Where("user_id = ? AND is_read = ?", userId, false).Update("is_read", true).Error
}

func (n *NotificationRepository) FindUserIdsByRoles(roles []string) ([]string, error) {
	if len(roles) == 0 {
		return []string{}, nil
	}
	var userIds []string
	err := n.Db.Model(&model.User{}).Where("role IN ?", roles).Pluck("id", &userIds).Error
	return userIds, err
}
