package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/MhmdEagel/lms-usti-be/data"
	"github.com/MhmdEagel/lms-usti-be/services"
	"github.com/MhmdEagel/lms-usti-be/sse"
	"github.com/gin-gonic/gin"
)

const (
	notificationHeartbeat = 15 * time.Second
)

type NotificationController struct {
	notificationService services.NotificationServiceInterface
	broker              *sse.Broker
}

func NewNotificationController(notificationService services.NotificationServiceInterface, broker *sse.Broker) *NotificationController {
	return &NotificationController{notificationService: notificationService, broker: broker}
}

func notificationUser(ctx *gin.Context) (data.MeResponse, bool) {
	val, exist := ctx.Get("user")
	if !exist {
		return data.MeResponse{}, false
	}
	user, ok := val.(data.MeResponse)
	return user, ok
}

func (n *NotificationController) FindAll(ctx *gin.Context) {
	user, ok := notificationUser(ctx)
	if !ok {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	limit, _ := strconv.Atoi(ctx.Query("limit"))
	page, _ := strconv.Atoi(ctx.Query("page"))
	pagination := data.Pagination{Limit: limit, Current: page}

	result, err := n.notificationService.FindAll(user.ID, pagination)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewPaginationResponse(http.StatusOK, "berhasil mengambil notifikasi", result.Pagination, result.Data)
	ctx.JSON(http.StatusOK, res)
}

func (n *NotificationController) UnreadCount(ctx *gin.Context) {
	user, ok := notificationUser(ctx)
	if !ok {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	count, err := n.notificationService.UnreadCount(user.ID)
	if err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "berhasil mengambil jumlah notifikasi", data.NotificationUnreadCountResponse{UnreadCount: count})
	ctx.JSON(http.StatusOK, res)
}

func (n *NotificationController) MarkAsRead(ctx *gin.Context) {
	user, ok := notificationUser(ctx)
	if !ok {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	if err := n.notificationService.MarkAsRead(ctx.Param("id"), user.ID); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "notifikasi ditandai sudah dibaca", nil)
	ctx.JSON(http.StatusOK, res)
}

func (n *NotificationController) MarkAllAsRead(ctx *gin.Context) {
	user, ok := notificationUser(ctx)
	if !ok {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	if err := n.notificationService.MarkAllAsRead(user.ID); err != nil {
		handleError(ctx, err)
		return
	}
	res := data.NewResponse(http.StatusOK, "semua notifikasi ditandai sudah dibaca", nil)
	ctx.JSON(http.StatusOK, res)
}

// Stream keeps an authenticated Server-Sent Events connection open and pushes
// every notification created for the current user in realtime.
func (n *NotificationController) Stream(ctx *gin.Context) {
	user, ok := notificationUser(ctx)
	if !ok {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}
	if n.broker == nil {
		handleError(ctx, data.ErrInternalServer(nil))
		return
	}

	payloads, unsubscribe, allowed := n.broker.Subscribe(user.ID)
	if !allowed {
		res := data.NewResponse(http.StatusTooManyRequests, "terlalu banyak koneksi notifikasi aktif", nil)
		ctx.JSON(http.StatusTooManyRequests, res)
		return
	}
	defer unsubscribe()

	header := ctx.Writer.Header()
	header.Set("Content-Type", "text/event-stream; charset=utf-8")
	header.Set("Cache-Control", "no-cache")
	header.Set("Connection", "keep-alive")
	header.Set("X-Accel-Buffering", "no")
	ctx.Writer.Flush()

	ctx.SSEvent("connected", `{"status":"connected"}`)
	ctx.Writer.Flush()

	heartbeat := time.NewTicker(notificationHeartbeat)
	defer heartbeat.Stop()

	done := ctx.Request.Context().Done()
	for {
		select {
		case <-done:
			return
		case <-heartbeat.C:
			fmt.Fprint(ctx.Writer, ": ping\n\n")
			ctx.Writer.Flush()
		case payload, open := <-payloads:
			if !open {
				return
			}
			ctx.SSEvent("notification", string(payload))
			ctx.Writer.Flush()
		}
	}
}
