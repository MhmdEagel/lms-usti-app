package services

import (
	"errors"
	"sync"
	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/model"
	"github.com/MhmdEagel/lms-usti-be/repositories"
	"gorm.io/gorm"
)

const rateLimiterCleanupInterval = 1 * time.Minute

const (
	maxMessageLength    = 5000
	maxGroupParticipants = 50
	rateLimitPerSecond  = 5
)

type userRateLimiter struct {
	mu       sync.Mutex
	counters map[string]*rateBucket
}

type rateBucket struct {
	count    int
	resetAt  time.Time
}

func newUserRateLimiter() *userRateLimiter {
	return &userRateLimiter{
		counters: make(map[string]*rateBucket),
	}
}

func (rl *userRateLimiter) Cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for userID, bucket := range rl.counters {
		if now.After(bucket.resetAt) {
			delete(rl.counters, userID)
		}
	}
}

func (rl *userRateLimiter) Allow(userID string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	bucket, ok := rl.counters[userID]
	now := time.Now()

	if !ok || now.After(bucket.resetAt) {
		rl.counters[userID] = &rateBucket{
			count:   1,
			resetAt: now.Add(time.Second),
		}
		return true
	}

	if bucket.count >= rateLimitPerSecond {
		return false
	}

	bucket.count++
	return true
}

type ChatService struct {
	conversationRepo repositories.ConversationRepositoryInterface
	messageRepo      repositories.MessageRepositoryInterface
	userRepo         repositories.UserRepositoryInterface
	rateLimiter      *userRateLimiter
}

type ChatServiceInterface interface {
	GetConversations(userID string) ([]data.ConversationResponse, error)
	CreateConversation(creatorID string, req data.CreateConversationRequest) (data.ConversationResponse, error)
	GetMessagesWithCursor(conversationID, userID, cursor string, limit int) ([]data.MessageResponse, error)
	SendMessage(conversationID, senderID, content string) (data.MessageResponse, error)
	MarkAsRead(messageID, userID string) error
	MarkConversationAsRead(conversationID, userID string) error
	IsParticipant(conversationID, userID string) (bool, error)
	SearchUsers(search string, excludeUserID string) ([]data.UserResponse, error)
}

func NewChatService(
	conversationRepo repositories.ConversationRepositoryInterface,
	messageRepo repositories.MessageRepositoryInterface,
	userRepo repositories.UserRepositoryInterface,
) ChatServiceInterface {
	svc := &ChatService{
		conversationRepo: conversationRepo,
		messageRepo:      messageRepo,
		userRepo:         userRepo,
		rateLimiter:      newUserRateLimiter(),
	}

	go func() {
		ticker := time.NewTicker(rateLimiterCleanupInterval)
		defer ticker.Stop()
		for range ticker.C {
			svc.rateLimiter.Cleanup()
		}
	}()

	return svc
}

func (s *ChatService) GetConversations(userID string) ([]data.ConversationResponse, error) {
	conversations, err := s.conversationRepo.FindAllByUserID(userID)
	if err != nil {
		return nil, err
	}

	if len(conversations) == 0 {
		return []data.ConversationResponse{}, nil
	}

	convIDs := make([]string, len(conversations))
	for i, conv := range conversations {
		convIDs[i] = conv.ID
	}

	lastMessages, err := s.messageRepo.GetLastMessagesByConversationIDs(convIDs)
	if err != nil {
		return nil, err
	}

	unreadCounts, err := s.messageRepo.CountUnreadBatch(convIDs, userID)
	if err != nil {
		return nil, err
	}

	var result []data.ConversationResponse
	for _, conv := range conversations {
		resp := s.conversationToResponse(conv)
		resp.UnreadCount = unreadCounts[conv.ID]

		if lastMsg, ok := lastMessages[conv.ID]; ok {
			msgResp := s.messageToResponse(lastMsg)
			resp.LastMessage = &msgResp
		}

		if conv.LastMessageAt != nil {
			f := conv.LastMessageAt.Format(time.RFC3339)
			resp.LastMessageAt = &f
		}

		result = append(result, resp)
	}

	return result, nil
}

func (s *ChatService) CreateConversation(creatorID string, req data.CreateConversationRequest) (data.ConversationResponse, error) {
	allIDs := append([]string{creatorID}, req.ParticipantIDs...)

	totalParticipants := len(allIDs)

	if totalParticipants == 2 {
		existing, err := s.conversationRepo.FindExistingConversation(allIDs[0], allIDs[1])
		if err == nil {
			return s.conversationToResponse(existing), nil
		}
	}

	if totalParticipants > maxGroupParticipants {
		return data.ConversationResponse{}, errors.New("maksimal 50 peserta per percakapan")
	}

	convType := "direct"
	convName := ""
	if totalParticipants > 2 {
		convType = "group"
		if req.Name != "" {
			convName = req.Name
		}
	}

	conv := &model.Conversation{
		Name: convName,
		Type: convType,
	}
	if err := s.conversationRepo.Create(conv); err != nil {
		return data.ConversationResponse{}, err
	}

	for _, uid := range allIDs {
		participant := &model.ConversationParticipant{
			ConversationID: conv.ID,
			UserID:         uid,
			JoinedAt:       time.Now(),
		}
		if err := s.conversationRepo.AddParticipant(participant); err != nil {
			return data.ConversationResponse{}, err
		}
	}

	created, err := s.conversationRepo.FindByID(conv.ID)
	if err != nil {
		return data.ConversationResponse{}, err
	}

	return s.conversationToResponse(created), nil
}

func (s *ChatService) GetMessagesWithCursor(conversationID, userID, cursor string, limit int) ([]data.MessageResponse, error) {
	if limit <= 0 {
		limit = 20
	}

	isParticipant, err := s.IsParticipant(conversationID, userID)
	if err != nil {
		return nil, err
	}
	if !isParticipant {
		return nil, errors.New("not a participant of this conversation")
	}

	messages, err := s.messageRepo.FindByCursor(conversationID, cursor, limit)
	if err != nil {
		return nil, err
	}

	var result []data.MessageResponse
	for i := len(messages) - 1; i >= 0; i-- {
		result = append(result, s.messageToResponse(messages[i]))
	}

	return result, nil
}

func (s *ChatService) SendMessage(conversationID, senderID, content string) (data.MessageResponse, error) {
	if len(content) > maxMessageLength {
		return data.MessageResponse{}, errors.New("pesan terlalu panjang, maksimal 5000 karakter")
	}

	if !s.rateLimiter.Allow(senderID) {
		return data.MessageResponse{}, errors.New("terlalu banyak pesan, silakan coba lagi")
	}

	msg := &model.Message{
		ConversationID: conversationID,
		SenderID:       senderID,
		Type:           "text",
		Content:        content,
	}

	if err := s.messageRepo.Create(msg); err != nil {
		return data.MessageResponse{}, err
	}

	now := time.Now()
	if err := s.conversationRepo.UpdateLastMessageAt(conversationID, now); err != nil {
		return data.MessageResponse{}, err
	}

	created, err := s.messageRepo.FindByID(msg.ID)
	if err != nil {
		return data.MessageResponse{}, err
	}

	return s.messageToResponse(created), nil
}

func (s *ChatService) MarkAsRead(messageID, userID string) error {
	return s.messageRepo.CreateReadReceipt(messageID, userID)
}

func (s *ChatService) MarkConversationAsRead(conversationID, userID string) error {
	messages, err := s.messageRepo.FindByConversationID(conversationID, 100, 0)
	if err != nil {
		return err
	}

	for _, msg := range messages {
		if msg.SenderID != userID {
			hasRead, err := s.messageRepo.HasReadReceipt(msg.ID, userID)
			if err != nil {
				continue
			}
			if !hasRead {
				if err := s.messageRepo.CreateReadReceipt(msg.ID, userID); err != nil {
					continue
				}
			}
		}
	}
	return nil
}

func (s *ChatService) IsParticipant(conversationID, userID string) (bool, error) {
	_, err := s.conversationRepo.FindParticipant(conversationID, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (s *ChatService) conversationToResponse(conv model.Conversation) data.ConversationResponse {
	var participants []data.ParticipantResponse
	for _, p := range conv.Participants {
		participants = append(participants, data.ParticipantResponse{
			ID:     p.ID,
			UserID: p.UserID,
			User: data.UserResponse{
				ID:       p.User.ID,
				Fullname: p.User.Fullname,
				Email:    p.User.Email,
				Profile:  p.User.Image,
				Role:     p.User.Role,
			},
			JoinedAt: p.JoinedAt.Format(time.RFC3339),
		})
	}

	return data.ConversationResponse{
		ID:           conv.ID,
		Name:         conv.Name,
		Type:         conv.Type,
		Participants: participants,
		UpdatedAt:    conv.UpdatedAt.Format(time.RFC3339),
		CreatedAt:    conv.CreatedAt.Format(time.RFC3339),
	}
}

func (s *ChatService) messageToResponse(msg model.Message) data.MessageResponse {
	var readBy []data.ReadByResponse
	for _, rb := range msg.ReadBy {
		readBy = append(readBy, data.ReadByResponse{
			UserID:   rb.UserID,
			Fullname: rb.User.Fullname,
			ReadAt:   rb.ReadAt.Format(time.RFC3339),
		})
	}
	if readBy == nil {
		readBy = []data.ReadByResponse{}
	}

	msgType := msg.Type
	if msgType == "" {
		msgType = "text"
	}

	return data.MessageResponse{
		ID:             msg.ID,
		ConversationID: msg.ConversationID,
		SenderID:       msg.SenderID,
		Sender: data.UserResponse{
			ID:       msg.Sender.ID,
			Fullname: msg.Sender.Fullname,
			Email:    msg.Sender.Email,
			Profile:  msg.Sender.Image,
			Role:     msg.Sender.Role,
		},
		Type:      msgType,
		Content:   msg.Content,
		CreatedAt: msg.CreatedAt.Format(time.RFC3339),
		ReadBy:    readBy,
	}
}

func (s *ChatService) SearchUsers(search string, excludeUserID string) ([]data.UserResponse, error) {
	if search == "" {
		return []data.UserResponse{}, nil
	}

	users, err := s.userRepo.FindBySearch(search)
	if err != nil {
		return nil, err
	}

	var result []data.UserResponse
	for _, u := range users {
		if u.ID == excludeUserID {
			continue
		}
		result = append(result, data.UserResponse{
			ID:       u.ID,
			Fullname: u.Fullname,
			Email:    u.Email,
			Profile:  u.Image,
			Role:     u.Role,
		})
	}

	if result == nil {
		result = []data.UserResponse{}
	}
	return result, nil
}
