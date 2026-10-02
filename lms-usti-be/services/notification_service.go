package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"github.com/MhmdEagel/lms-usti-be/sse"
	"gorm.io/gorm"
)

type NotificationService struct {
	notificationRepository repositories.NotificationRepositoryInterface
	classroomRepository    repositories.ClassroomRepositoryInterface
	broker                 *sse.Broker
}

type NotificationServiceInterface interface {
	NotifyAssignmentCreated(classroomId, assignmentId, assignmentTitle, classroomName string) error
	NotifySubmissionGraded(studentId, classroomId, assignmentId, assignmentTitle string, score *float64) error
	NotifyForumPostCreated(forumPostId, authorId, title, authorName string) error
	NotifyClassroomBroadcast(classroomId, classroomName, senderName, title, content, conversationId string) error
	FindAll(userId string, pagination data.Pagination) (result *data.PaginationWithData, err error)
	UnreadCount(userId string) (int64, error)
	MarkAsRead(id string, userId string) error
	MarkAllAsRead(userId string) error
	DeleteByAssignment(assignmentId string) error
	DeleteByForumPost(forumPostId string) error
}

func NewNotificationService(
	notificationRepository repositories.NotificationRepositoryInterface,
	classroomRepository repositories.ClassroomRepositoryInterface,
	broker *sse.Broker,
) NotificationServiceInterface {
	return &NotificationService{
		notificationRepository: notificationRepository,
		classroomRepository:    classroomRepository,
		broker:                 broker,
	}
}

// notifyAsync runs a notification fan-out in the background so a failure
// can never break the business action that triggered it.
func notifyAsync(fn func() error) {
	go func() {
		if err := fn(); err != nil {
			log.Printf("Notification: %v", err)
		}
	}()
}

func (n *NotificationService) NotifyAssignmentCreated(classroomId, assignmentId, assignmentTitle, classroomName string) error {
	members, err := n.classroomRepository.FindAllClassroomMahasiswa(classroomId)
	if err != nil {
		return err
	}
	recipients := make([]string, 0, len(members))
	for _, member := range members {
		recipients = append(recipients, member.UserId)
	}
	notification := model.Notification{
		Type:         model.NotificationTypeAssignmentCreated,
		Title:        fmt.Sprintf("Tugas baru: %s", assignmentTitle),
		Body:         fmt.Sprintf("Tugas \"%s\" dibuat di kelas %s.", assignmentTitle, classroomName),
		ClassroomId:  classroomId,
		AssignmentId: assignmentId,
	}
	return n.persistAndPublish(recipients, notification)
}

func (n *NotificationService) NotifySubmissionGraded(studentId, classroomId, assignmentId, assignmentTitle string, score *float64) error {
	body := fmt.Sprintf("Tugas \"%s\" kamu telah dinilai.", assignmentTitle)
	if score != nil {
		body = fmt.Sprintf("Tugas \"%s\" kamu telah dinilai dengan nilai %g.", assignmentTitle, *score)
	}
	notification := model.Notification{
		Type:         model.NotificationTypeSubmissionGraded,
		Title:        "Tugas telah dinilai",
		Body:         body,
		ClassroomId:  classroomId,
		AssignmentId: assignmentId,
	}
	return n.persistAndPublish([]string{studentId}, notification)
}

func (n *NotificationService) NotifyForumPostCreated(forumPostId, authorId, title, authorName string) error {
	recipientIds, err := n.notificationRepository.FindUserIdsByRoles([]string{"DOSEN", "MAHASISWA", "PRODI"})
	if err != nil {
		return err
	}
	recipients := make([]string, 0, len(recipientIds))
	for _, recipientId := range recipientIds {
		if recipientId == authorId {
			continue
		}
		recipients = append(recipients, recipientId)
	}
	notification := model.Notification{
		Type:        model.NotificationTypeForumPostCreated,
		Title:       "Postingan forum baru",
		Body:        fmt.Sprintf("%s memposting \"%s\" di forum.", authorName, title),
		ForumPostId: forumPostId,
	}
	return n.persistAndPublish(recipients, notification)
}

func (n *NotificationService) NotifyClassroomBroadcast(classroomId, classroomName, senderName, title, content, conversationId string) error {
	members, err := n.classroomRepository.FindAllClassroomMahasiswa(classroomId)
	if err != nil {
		return err
	}
	recipients := make([]string, 0, len(members))
	for _, member := range members {
		recipients = append(recipients, member.UserId)
	}
	notification := model.Notification{
		Type:           model.NotificationTypeClassroomBroadcast,
		Title:          fmt.Sprintf("Broadcast: %s", title),
		Body:           fmt.Sprintf("%s mengirim pesan di kelas %s: %s", senderName, classroomName, content),
		ClassroomId:    classroomId,
		ConversationId: conversationId,
	}
	return n.persistAndPublish(recipients, notification)
}

func (n *NotificationService) persistAndPublish(recipients []string, notification model.Notification) error {
	if len(recipients) == 0 {
		return nil
	}
	notifications := make([]model.Notification, 0, len(recipients))
	for _, recipient := range recipients {
		if recipient == "" {
			continue
		}
		item := notification
		item.UserId = recipient
		notifications = append(notifications, item)
	}
	if len(notifications) == 0 {
		return nil
	}
	if err := n.notificationRepository.CreateBulk(notifications); err != nil {
		return err
	}
	if n.broker == nil {
		return nil
	}
	for _, item := range notifications {
		payload, err := json.Marshal(toNotificationResponse(item))
		if err != nil {
			continue
		}
		n.broker.Publish(item.UserId, payload)
	}
	return nil
}

func (n *NotificationService) FindAll(userId string, pagination data.Pagination) (*data.PaginationWithData, error) {
	result, err := n.notificationRepository.FindAllByUserId(userId, pagination)
	if err != nil {
		return nil, data.ErrInternalServer(err)
	}
	notifications, ok := result.Data.([]model.Notification)
	if !ok {
		return result, nil
	}
	responses := make([]data.NotificationResponse, 0, len(notifications))
	for _, item := range notifications {
		responses = append(responses, toNotificationResponse(item))
	}
	result.Data = responses
	return result, nil
}

func (n *NotificationService) UnreadCount(userId string) (int64, error) {
	count, err := n.notificationRepository.CountUnread(userId)
	if err != nil {
		return 0, data.ErrInternalServer(err)
	}
	return count, nil
}

func (n *NotificationService) MarkAsRead(id string, userId string) error {
	if err := n.notificationRepository.MarkAsRead(id, userId); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return data.ErrNotificationNotFound(err)
		}
		return data.ErrInternalServer(err)
	}
	return nil
}

func (n *NotificationService) MarkAllAsRead(userId string) error {
	if err := n.notificationRepository.MarkAllAsRead(userId); err != nil {
		return data.ErrInternalServer(err)
	}
	return nil
}

func (n *NotificationService) DeleteByAssignment(assignmentId string) error {
	if err := n.notificationRepository.DeleteByAssignmentId(assignmentId); err != nil {
		return data.ErrInternalServer(err)
	}
	return nil
}

func (n *NotificationService) DeleteByForumPost(forumPostId string) error {
	if err := n.notificationRepository.DeleteByForumPostId(forumPostId); err != nil {
		return data.ErrInternalServer(err)
	}
	return nil
}

func toNotificationResponse(notification model.Notification) data.NotificationResponse {
	return data.NotificationResponse{
		ID:             notification.ID,
		Type:           notification.Type,
		Title:          notification.Title,
		Body:           notification.Body,
		ClassroomId:    notification.ClassroomId,
		ConversationId: notification.ConversationId,
		AssignmentId:   notification.AssignmentId,
		ForumPostId:    notification.ForumPostId,
		IsRead:         notification.IsRead,
		CreatedAt:      notification.CreatedAt,
	}
}
