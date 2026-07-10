package websocket

import (
	"sync"

	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const maxConnectionsPerUser = 5

type Hub struct {
	mu          sync.RWMutex
	clients     map[string][]*Client
	rooms       map[string]*Room
	register    chan *Client
	unregister  chan *Client
	chatService services.ChatServiceInterface
}

func NewHub(chatService services.ChatServiceInterface) *Hub {
	return &Hub{
		clients:     make(map[string][]*Client),
		rooms:       make(map[string]*Room),
		register:    make(chan *Client, 256),
		unregister:  make(chan *Client, 256),
		chatService: chatService,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if len(h.clients[client.userID]) >= maxConnectionsPerUser {
				h.mu.Unlock()
				func() {
					defer func() { recover() }()
					client.conn.WriteMessage(websocket.TextMessage, []byte(`{"type":"error","message":"terlalu banyak koneksi aktif"}`))
					client.conn.Close()
				}()
			} else {
				h.clients[client.userID] = append(h.clients[client.userID], client)
				h.mu.Unlock()
			}

		case client := <-h.unregister:
			h.mu.Lock()
			clients := h.clients[client.userID]
			filtered := make([]*Client, 0, len(clients))
			for _, c := range clients {
				if c.id != client.id {
					filtered = append(filtered, c)
				}
			}
			if len(filtered) == 0 {
				delete(h.clients, client.userID)
			} else {
				h.clients[client.userID] = filtered
			}

			rooms := make([]*Room, 0, len(h.rooms))
			for _, room := range h.rooms {
				rooms = append(rooms, room)
			}
			h.mu.Unlock()

			for _, room := range rooms {
				room.Unregister(client)
			}
			client.SafeCloseSend()
		}
	}
}

func (h *Hub) GetOrCreateRoom(conversationID string) *Room {
	h.mu.Lock()
	defer h.mu.Unlock()

	if room, ok := h.rooms[conversationID]; ok {
		return room
	}

	room := NewRoom(conversationID)
	h.rooms[conversationID] = room
	go room.Run()
	return room
}

func (h *Hub) GetRoom(conversationID string) *Room {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.rooms[conversationID]
}

func (h *Hub) RegisterClient(client *Client) {
	h.register <- client
}

func (h *Hub) UnregisterClient(client *Client) {
	h.unregister <- client
}

func (h *Hub) GetChatService() services.ChatServiceInterface {
	return h.chatService
}

func (h *Hub) GetClients(userID string) []*Client {
	h.mu.RLock()
	defer h.mu.RUnlock()
	clients := h.clients[userID]
	result := make([]*Client, len(clients))
	copy(result, clients)
	return result
}

func GenerateConnectionID() string {
	id, _ := uuid.NewRandom()
	return id.String()
}
