package controllers

import (
	"net/http"
	"strconv"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/MhmdEagel/lms-usti-be/websocket"
	"github.com/gin-gonic/gin"
)

type ChatController struct {
	chatService services.ChatServiceInterface
	hub         *websocket.Hub
}

func NewChatController(chatService services.ChatServiceInterface, hub *websocket.Hub) *ChatController {
	return &ChatController{
		chatService: chatService,
		hub:         hub,
	}
}

func (c *ChatController) GetConversations(ctx *gin.Context) {
	val, exist := ctx.Get("user")
	if !exist {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	user := val.(data.MeResponse)

	conversations, err := c.chatService.GetConversations(user.ID)
	if err != nil {
		handleError(ctx, err)
		return
	}

	if conversations == nil {
		conversations = []data.ConversationResponse{}
	}

	res := data.NewResponse(http.StatusOK, "berhasil mengambil percakapan", conversations)
	ctx.JSON(http.StatusOK, res)
}

func (c *ChatController) CreateConversation(ctx *gin.Context) {
	var req data.CreateConversationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}

	val, exist := ctx.Get("user")
	if !exist {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	user := val.(data.MeResponse)

	conversation, err := c.chatService.CreateConversation(user.ID, req)
	if err != nil {
		handleError(ctx, err)
		return
	}

	res := data.NewResponse(http.StatusOK, "percakapan berhasil dibuat", conversation)
	ctx.JSON(http.StatusOK, res)
}

func (c *ChatController) GetMessages(ctx *gin.Context) {
	conversationID := ctx.Param("id")

	val, exist := ctx.Get("user")
	if !exist {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	user := val.(data.MeResponse)

	isParticipant, err := c.chatService.IsParticipant(conversationID, user.ID)
	if err != nil || !isParticipant {
		handleError(ctx, data.ErrUnauthorized(nil))
		return
	}

	cursor := ctx.Query("cursor")
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "20"))

	messages, err := c.chatService.GetMessagesWithCursor(conversationID, user.ID, cursor, limit)
	if err != nil {
		handleError(ctx, err)
		return
	}

	if messages == nil {
		messages = []data.MessageResponse{}
	}

	res := data.NewResponse(http.StatusOK, "berhasil mengambil pesan", messages)
	ctx.JSON(http.StatusOK, res)
}

func (c *ChatController) SendMessage(ctx *gin.Context) {
	conversationID := ctx.Param("id")

	var req data.SendMessageRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		bindJSONError(ctx, err)
		return
	}

	val, exist := ctx.Get("user")
	if !exist {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	user := val.(data.MeResponse)

	isParticipant, err := c.chatService.IsParticipant(conversationID, user.ID)
	if err != nil || !isParticipant {
		handleError(ctx, data.ErrUnauthorized(nil))
		return
	}

	message, err := c.chatService.SendMessage(conversationID, user.ID, req.Content)
	if err != nil {
		handleError(ctx, err)
		return
	}

	// Broadcast to WebSocket clients in the room
	room := c.hub.GetRoom(conversationID)
	if room != nil {
		room.Broadcast(map[string]any{
			"type":    "message",
			"message": message,
		})
	}

	res := data.NewResponse(http.StatusOK, "pesan berhasil dikirim", message)
	ctx.JSON(http.StatusOK, res)
}

func (c *ChatController) MarkConversationAsRead(ctx *gin.Context) {
	conversationID := ctx.Param("id")

	val, exist := ctx.Get("user")
	if !exist {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	user := val.(data.MeResponse)

	if err := c.chatService.MarkConversationAsRead(conversationID, user.ID); err != nil {
		handleError(ctx, err)
		return
	}

	res := data.NewResponse(http.StatusOK, "percakapan ditandai sudah dibaca", nil)
	ctx.JSON(http.StatusOK, res)
}

func (c *ChatController) SearchUsers(ctx *gin.Context) {
	search := ctx.Query("search")

	val, exist := ctx.Get("user")
	if !exist {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	user := val.(data.MeResponse)

	users, err := c.chatService.SearchUsers(search, user.ID)
	if err != nil {
		handleError(ctx, err)
		return
	}

	res := data.NewResponse(http.StatusOK, "berhasil mencari pengguna", users)
	ctx.JSON(http.StatusOK, res)
}
