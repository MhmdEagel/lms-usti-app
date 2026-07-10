package websocket

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WebSocketHandler struct {
	hub *Hub
}

func NewWebSocketHandler(hub *Hub) *WebSocketHandler {
	return &WebSocketHandler{hub: hub}
}

func (h *WebSocketHandler) HandleUpgrade(ctx *gin.Context) {
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		return
	}

	client := NewUnauthenticatedClient(h.hub, conn)

	var closeOnce sync.Once
	closeConn := func() {
		closeOnce.Do(func() {
			client.conn.Close()
		})
	}

	go func() {
		time.Sleep(authTimeout)
		if !client.isAuth.Load() {
			func() {
				defer func() { recover() }()
				client.conn.WriteMessage(websocket.TextMessage, []byte(`{"type":"error","message":"auth timeout"}`))
			}()
			closeConn()
		}
	}()

	go client.WritePump()
	go client.ReadPump()
}
