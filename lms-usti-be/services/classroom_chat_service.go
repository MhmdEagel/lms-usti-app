package services

import (
	"errors"
	"log"
	"time"

	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"gorm.io/gorm"
)

// ClassroomChatService keeps the one-per-classroom group conversation in sync
// with classroom lifecycle events: provisioning on creation, membership on
// enroll/unenroll, and full cleanup on classroom deletion.
type ClassroomChatService struct {
	classroomRepository    repositories.ClassroomRepositoryInterface
	conversationRepository repositories.ConversationRepositoryInterface
}

type ClassroomChatServiceInterface interface {
	EnsureClassroomGroup(classroomId string) error
	GetOrCreateGroup(classroomId string) (model.Conversation, error)
	AddMember(classroomId, userId string) error
	RemoveMember(classroomId, userId string) error
	DeleteForClassroom(classroomId string) error
	BackfillClassroomGroups() error
}

func NewClassroomChatService(
	classroomRepository repositories.ClassroomRepositoryInterface,
	conversationRepository repositories.ConversationRepositoryInterface,
) ClassroomChatServiceInterface {
	return &ClassroomChatService{
		classroomRepository:    classroomRepository,
		conversationRepository: conversationRepository,
	}
}

// EnsureClassroomGroup is idempotent: it returns the existing classroom group
// or creates one with the owning dosen and every currently enrolled mahasiswa.
func (s *ClassroomChatService) EnsureClassroomGroup(classroomId string) error {
	_, err := s.ensureGroup(classroomId)
	return err
}

// GetOrCreateGroup returns the classroom group, provisioning it first if it
// does not exist yet (e.g. a classroom seeded before the feature ran).
func (s *ClassroomChatService) GetOrCreateGroup(classroomId string) (model.Conversation, error) {
	return s.ensureGroup(classroomId)
}

func (s *ClassroomChatService) AddMember(classroomId, userId string) error {
	group, err := s.ensureGroup(classroomId)
	if err != nil {
		return err
	}
	return s.conversationRepository.AddParticipantIfAbsent(&model.ConversationParticipant{
		ConversationID: group.ID,
		UserID:         userId,
		JoinedAt:       time.Now(),
	})
}

func (s *ClassroomChatService) RemoveMember(classroomId, userId string) error {
	group, err := s.conversationRepository.FindByClassroomId(classroomId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}
	return s.conversationRepository.RemoveParticipant(group.ID, userId)
}

func (s *ClassroomChatService) DeleteForClassroom(classroomId string) error {
	return s.conversationRepository.DeleteByClassroomId(classroomId)
}

// BackfillClassroomGroups creates the group for every classroom that predates
// the feature. Safe to run on every startup; failures are logged per classroom
// and never block startup.
func (s *ClassroomChatService) BackfillClassroomGroups() error {
	var classrooms []model.Classroom
	if err := s.classroomRepository.DB().Find(&classrooms).Error; err != nil {
		return err
	}
	for _, classroom := range classrooms {
		if err := s.EnsureClassroomGroup(classroom.ID); err != nil {
			log.Printf("ClassroomChat backfill %s: %v", classroom.ID, err)
		}
	}
	return nil
}

func (s *ClassroomChatService) ensureGroup(classroomId string) (model.Conversation, error) {
	if classroomId == "" {
		return model.Conversation{}, gorm.ErrRecordNotFound
	}
	existing, err := s.conversationRepository.FindByClassroomId(classroomId)
	if err == nil {
		return existing, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return model.Conversation{}, err
	}

	classroom, err := s.classroomRepository.FindById(classroomId)
	if err != nil {
		return model.Conversation{}, err
	}
	members, err := s.classroomRepository.FindAllClassroomMahasiswa(classroomId)
	if err != nil {
		return model.Conversation{}, err
	}

	ownerId := classroom.DosenId
	participantIds := []string{ownerId}
	for _, member := range members {
		if member.UserId == "" || member.UserId == ownerId {
			continue
		}
		participantIds = append(participantIds, member.UserId)
	}

	classroomGroupId := classroomId
	group := &model.Conversation{
		Name:        classroom.ClassName,
		Type:        "group",
		ClassroomId: &classroomGroupId,
	}
	if err := s.conversationRepository.Create(group); err != nil {
		// A concurrent ensure may have won the race on the unique classroom_id
		// index — treat an existing group as success.
		if existing, findErr := s.conversationRepository.FindByClassroomId(classroomId); findErr == nil {
			return existing, nil
		}
		return model.Conversation{}, err
	}

	for _, userId := range participantIds {
		if err := s.conversationRepository.AddParticipantIfAbsent(&model.ConversationParticipant{
			ConversationID: group.ID,
			UserID:         userId,
			JoinedAt:       time.Now(),
		}); err != nil {
			return model.Conversation{}, err
		}
	}

	created, err := s.conversationRepository.FindByID(group.ID)
	if err != nil {
		return model.Conversation{}, err
	}
	return created, nil
}
