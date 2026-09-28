package services

import (
	"errors"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"gorm.io/gorm"
)

type BroadcastService struct {
	classroomRepository repositories.ClassroomRepositoryInterface
	notificationService NotificationServiceInterface
}

type BroadcastServiceInterface interface {
	Send(classroomId, senderId, senderName string, request data.BroadcastMessageRequest) (data.BroadcastMessageResponse, error)
}

func NewBroadcastService(classroomRepository repositories.ClassroomRepositoryInterface, notificationService NotificationServiceInterface) BroadcastServiceInterface {
	return &BroadcastService{
		classroomRepository: classroomRepository,
		notificationService: notificationService,
	}
}

// Send verifies the sender owns the classroom, validates that there is at
// least one enrolled student, then fans the message out as an in-app
// notification. Delivery runs in the background so a failure never fails
// the request.
func (b *BroadcastService) Send(classroomId, senderId, senderName string, request data.BroadcastMessageRequest) (data.BroadcastMessageResponse, error) {
	classroom, err := b.classroomRepository.FindById(classroomId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return data.BroadcastMessageResponse{}, data.ErrClassroomNotFound(err)
		}
		return data.BroadcastMessageResponse{}, data.ErrInternalServer(err)
	}
	if classroom.DosenId != senderId {
		return data.BroadcastMessageResponse{}, data.ErrBroadcastForbidden(nil)
	}
	if classroom.IsArchived {
		return data.BroadcastMessageResponse{}, data.ErrClassroomArchived(nil)
	}

	members, err := b.classroomRepository.FindAllClassroomMahasiswa(classroomId)
	if err != nil {
		return data.BroadcastMessageResponse{}, data.ErrInternalServer(err)
	}
	if len(members) == 0 {
		return data.BroadcastMessageResponse{}, data.ErrBroadcastNoRecipients(nil)
	}

	notifyAsync(func() error {
		return b.notificationService.NotifyClassroomBroadcast(classroom.ID, classroom.ClassName, senderName, request.Title, request.Content)
	})

	return data.BroadcastMessageResponse{RecipientCount: int64(len(members))}, nil
}
