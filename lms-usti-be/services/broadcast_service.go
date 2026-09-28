package services

import (
	"errors"
	"fmt"
	"log"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"gorm.io/gorm"
)

// MessageBroadcaster pushes a chat message to everyone connected to a
// conversation room over WebSocket. *websocket.Hub implements it.
type MessageBroadcaster interface {
	BroadcastToRoom(conversationID string, payload map[string]any)
}

type BroadcastService struct {
	classroomRepository  repositories.ClassroomRepositoryInterface
	classroomChatService ClassroomChatServiceInterface
	chatService          ChatServiceInterface
	broadcaster          MessageBroadcaster
	notificationService  NotificationServiceInterface
}

type BroadcastServiceInterface interface {
	Send(classroomId, senderId, senderName string, request data.BroadcastMessageRequest) (data.BroadcastMessageResponse, error)
}

func NewBroadcastService(
	classroomRepository repositories.ClassroomRepositoryInterface,
	classroomChatService ClassroomChatServiceInterface,
	chatService ChatServiceInterface,
	broadcaster MessageBroadcaster,
	notificationService NotificationServiceInterface,
) BroadcastServiceInterface {
	return &BroadcastService{
		classroomRepository:  classroomRepository,
		classroomChatService: classroomChatService,
		chatService:          chatService,
		broadcaster:          broadcaster,
		notificationService:  notificationService,
	}
}

// Send verifies the sender owns the classroom, validates that there is at
// least one enrolled student, then fans the message out twice: as a message
// in the classroom group chat and as an in-app notification deep-linking to
// that group. Delivery runs in the background so a failure never fails the
// request.
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

	// Resolve the classroom group so the broadcast lands in the chat and the
	// notification can deep-link straight to it.
	var conversationId string
	group, err := b.classroomChatService.GetOrCreateGroup(classroomId)
	if err != nil {
		log.Printf("Broadcast: gagal menyiapkan group chat kelas: %v", err)
	} else {
		conversationId = group.ID
	}

	chatContent := fmt.Sprintf("%s\n\n%s", request.Title, request.Content)

	notifyAsync(func() error {
		// Post to the group first so the message already exists by the time
		// the recipient opens the notification.
		if conversationId != "" {
			message, err := b.chatService.PostMessage(conversationId, senderId, chatContent)
			if err != nil {
				log.Printf("Broadcast: gagal posting ke group chat: %v", err)
			} else if b.broadcaster != nil {
				b.broadcaster.BroadcastToRoom(conversationId, map[string]any{
					"type":    "message",
					"message": message,
				})
			}
		}
		return b.notificationService.NotifyClassroomBroadcast(classroom.ID, classroom.ClassName, senderName, request.Title, request.Content, conversationId)
	})

	return data.BroadcastMessageResponse{RecipientCount: int64(len(members))}, nil
}
