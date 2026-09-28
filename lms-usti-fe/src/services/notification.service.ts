import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";

export const notificationServices = {
  findAll: (params?: { page?: number; limit?: number }) =>
    instance.get(endpoint.NOTIFICATION, { params }),
  unreadCount: () => instance.get(`${endpoint.NOTIFICATION}/unread-count`),
  markAsRead: (notificationId: string) =>
    instance.patch(`${endpoint.NOTIFICATION}/${notificationId}/read`),
  markAllAsRead: () => instance.patch(`${endpoint.NOTIFICATION}/read-all`),
};
