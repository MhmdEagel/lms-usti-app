import instance from "@/lib/axios"
import endpoint from "./endpoint.constant"

interface CreateConversationPayload {
  participant_ids: string[]
  name?: string
}

interface GetMessagesParams {
  cursor?: string
  limit?: number
}

export const chatServices = {
  searchUsers: (search: string) =>
    instance.get(`${endpoint.CHAT}/users`, { params: { search } }),
  getConversations: () => instance.get(`${endpoint.CHAT}/conversations`),

  createConversation: (payload: CreateConversationPayload) =>
    instance.post(`${endpoint.CHAT}/conversations`, payload),

  getMessages: (conversationId: string, params?: GetMessagesParams) =>
    instance.get(`${endpoint.CHAT}/conversations/${conversationId}/messages`, { params }),

  sendMessage: (conversationId: string, content: string) =>
    instance.post(`${endpoint.CHAT}/conversations/${conversationId}/messages`, { content }),

  markConversationAsRead: (conversationId: string) =>
    instance.post(`${endpoint.CHAT}/conversations/${conversationId}/read`, {}),
}
