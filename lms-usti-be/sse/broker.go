package sse

import (
	"sync"

	"github.com/google/uuid"
)

const (
	maxConnectionsPerUser = 5
	bufferSize            = 32
)

type Broker struct {
	mu          sync.RWMutex
	subscribers map[string]map[string]chan []byte
}

func NewBroker() *Broker {
	return &Broker{
		subscribers: make(map[string]map[string]chan []byte),
	}
}

// Subscribe registers a new SSE connection for the given user.
// It returns the read-only channel of pending payloads, an idempotent
// unsubscribe function and false when the connection limit is reached.
func (b *Broker) Subscribe(userID string) (<-chan []byte, func(), bool) {
	b.mu.Lock()
	defer b.mu.Unlock()

	connections, ok := b.subscribers[userID]
	if !ok {
		connections = make(map[string]chan []byte)
		b.subscribers[userID] = connections
	}
	if len(connections) >= maxConnectionsPerUser {
		return nil, nil, false
	}

	connectionID, _ := uuid.NewRandom()
	payloads := make(chan []byte, bufferSize)
	connections[connectionID.String()] = payloads

	var once sync.Once
	unsubscribe := func() {
		once.Do(func() {
			b.mu.Lock()
			defer b.mu.Unlock()
			if conns, ok := b.subscribers[userID]; ok {
				if ch, ok := conns[connectionID.String()]; ok {
					delete(conns, connectionID.String())
					close(ch)
				}
				if len(conns) == 0 {
					delete(b.subscribers, userID)
				}
			}
		})
	}

	return payloads, unsubscribe, true
}

// Publish delivers a payload to every open connection of a user.
// Slow consumers drop the payload instead of blocking the caller.
func (b *Broker) Publish(userID string, payload []byte) int {
	b.mu.RLock()
	defer b.mu.RUnlock()

	delivered := 0
	for _, ch := range b.subscribers[userID] {
		select {
		case ch <- payload:
			delivered++
		default:
		}
	}
	return delivered
}

func (b *Broker) ConnectionCount(userID string) int {
	b.mu.RLock()
	defer b.mu.RUnlock()
	return len(b.subscribers[userID])
}
