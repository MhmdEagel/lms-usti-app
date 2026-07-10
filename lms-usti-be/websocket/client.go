package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"sync/atomic"
	"time"

	"github.com/MhmdEagel/lms-usti-be/lib"
	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 4096
	authTimeout    = 5 * time.Second
)

type Client struct {
	id        string
	hub       *Hub
	conn      *websocket.Conn
	send      chan []byte
	userID    string
	fullname  string
	rooms     map[string]bool
	isAuth    atomic.Bool
	closeOnce sync.Once
}

func NewUnauthenticatedClient(hub *Hub, conn *websocket.Conn) *Client {
	return &Client{
		id:    GenerateConnectionID(),
		hub:   hub,
		conn:  conn,
		send:  make(chan []byte, 256),
		rooms: make(map[string]bool),
	}
}

func (c *Client) ReadPump() {
	defer func() {
		if c.isAuth.Load() {
			c.hub.UnregisterClient(c)
		}
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure, websocket.CloseNoStatusReceived) {
				log.Printf("websocket error: %v", err)
			}
			break
		}

		var msg MessageIn
		if err := json.Unmarshal(message, &msg); err != nil {
			c.sendError("invalid message format")
			continue
		}

		if !c.isAuth.Load() {
			c.handleAuth(msg)
			continue
		}

		c.handleMessage(msg)
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) handleAuth(msg MessageIn) {
	if msg.Type != "auth" || msg.Token == "" {
		c.sendError("unauthorized, send auth message first")
		return
	}

	claims, err := lib.VerifyToken(msg.Token)
	if err != nil {
		c.sendError("invalid token")
		return
	}

	c.userID = claims.ID
	c.fullname = claims.Fullname
	c.isAuth.Store(true)

	c.hub.RegisterClient(c)

	c.sendJSON(map[string]string{
		"type":    "auth_ok",
		"user_id": c.userID,
	})
}

func (c *Client) sendJSON(v any) {
	data, err := json.Marshal(v)
	if err != nil {
		log.Printf("marshal error: %v", err)
		return
	}
	select {
	case c.send <- data:
	default:
		log.Printf("client %s send channel full, message dropped", c.id)
	}
}

func (c *Client) sendError(message string) {
	c.sendJSON(map[string]string{"type": "error", "message": message})
}

func (c *Client) SafeCloseSend() {
	c.closeOnce.Do(func() {
		close(c.send)
	})
}

func (c *Client) handleMessage(msg MessageIn) {
	switch msg.Type {
	case "join":
		c.handleJoin(msg)
	case "message":
		c.handleChatMessage(msg)
	case "typing":
		c.handleTyping(msg)
	case "stop_typing":
		c.handleStopTyping(msg)
	case "read":
		c.handleRead(msg)
	default:
		c.sendError("unknown message type")
	}
}

func (c *Client) handleJoin(msg MessageIn) {
	if msg.ConversationID == "" {
		c.sendError("conversation_id is required")
		return
	}

	svc := c.hub.GetChatService()
	isParticipant, err := svc.IsParticipant(msg.ConversationID, c.userID)
	if err != nil || !isParticipant {
		c.sendError("not a participant of this conversation")
		return
	}

	room := c.hub.GetOrCreateRoom(msg.ConversationID)
	room.Register(c)
	c.rooms[msg.ConversationID] = true

	messages, err := svc.GetMessagesWithCursor(msg.ConversationID, c.userID, "", 50)
	if err != nil {
		c.sendError("failed to get messages")
		return
	}

	c.sendJSON(map[string]any{
		"type":            "history",
		"conversation_id": msg.ConversationID,
		"messages":        messages,
	})
}

func (c *Client) handleChatMessage(msg MessageIn) {
	if msg.ConversationID == "" || msg.Content == "" {
		c.sendError("conversation_id and content are required")
		return
	}

	svc := c.hub.GetChatService()

	isParticipant, err := svc.IsParticipant(msg.ConversationID, c.userID)
	if err != nil || !isParticipant {
		c.sendError("not a participant of this conversation")
		return
	}

	// Auto-join room if not already joined
	room := c.hub.GetOrCreateRoom(msg.ConversationID)
	if !c.rooms[msg.ConversationID] {
		room.Register(c)
		c.rooms[msg.ConversationID] = true
	}

	saved, err := svc.SendMessage(msg.ConversationID, c.userID, msg.Content)
	if err != nil {
		c.sendError(err.Error())
		return
	}

	room.Broadcast(map[string]any{
		"type":    "message",
		"message": saved,
	})
}

func (c *Client) handleTyping(msg MessageIn) {
	if msg.ConversationID == "" {
		return
	}

	room := c.hub.GetRoom(msg.ConversationID)
	if room != nil {
		room.BroadcastExcept(c.userID, map[string]any{
			"type":            "typing",
			"conversation_id": msg.ConversationID,
			"user_id":         c.userID,
			"fullname":        c.fullname,
		})
	}
}

func (c *Client) handleStopTyping(msg MessageIn) {
	if msg.ConversationID == "" {
		return
	}

	room := c.hub.GetRoom(msg.ConversationID)
	if room != nil {
		room.BroadcastExcept(c.userID, map[string]any{
			"type":            "stop_typing",
			"conversation_id": msg.ConversationID,
			"user_id":         c.userID,
		})
	}
}

func (c *Client) handleRead(msg MessageIn) {
	if msg.ConversationID == "" || msg.MessageID == "" {
		return
	}

	svc := c.hub.GetChatService()
	svc.MarkAsRead(msg.MessageID, c.userID)

	room := c.hub.GetRoom(msg.ConversationID)
	if room != nil {
		room.BroadcastExcept(c.userID, map[string]any{
			"type":            "read_receipt",
			"conversation_id": msg.ConversationID,
			"message_id":      msg.MessageID,
			"user_id":         c.userID,
		})
	}
}
