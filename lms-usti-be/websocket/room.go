package websocket

import (
	"encoding/json"
	"log"
	"sync"
)

type Room struct {
	mu             sync.RWMutex
	conversationID string
	clients        []*Client
	broadcast      chan []byte
}

func NewRoom(conversationID string) *Room {
	return &Room{
		conversationID: conversationID,
		clients:        make([]*Client, 0),
		broadcast:      make(chan []byte, 256),
	}
}

func (r *Room) Run() {
	for message := range r.broadcast {
		r.mu.RLock()
		for _, client := range r.clients {
			select {
			case client.send <- message:
			default:
			}
		}
		r.mu.RUnlock()
	}
}

func (r *Room) Register(client *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, c := range r.clients {
		if c.id == client.id {
			return
		}
	}
	r.clients = append(r.clients, client)
}

func (r *Room) Unregister(client *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()

	filtered := make([]*Client, 0, len(r.clients))
	for _, c := range r.clients {
		if c.id != client.id {
			filtered = append(filtered, c)
		}
	}
	r.clients = filtered
}

func (r *Room) Broadcast(v any) {
	data, err := json.Marshal(v)
	if err != nil {
		log.Printf("room broadcast marshal error: %v", err)
		return
	}
	r.broadcast <- data
}

// BroadcastExcept sends to all room clients except the given userID.
// Note: This bypasses the broadcast channel and writes directly to client.send,
// which means messages from BroadcastExcept may arrive out of order relative
// to messages sent via Broadcast. This is an accepted trade-off for low-latency
// delivery of typing indicators and read receipts.
func (r *Room) BroadcastExcept(userID string, v any) {
	data, err := json.Marshal(v)
	if err != nil {
		log.Printf("room broadcast marshal error: %v", err)
		return
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, client := range r.clients {
		if client.userID != userID {
			select {
			case client.send <- data:
			default:
			}
		}
	}
}
