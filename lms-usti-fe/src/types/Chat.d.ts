interface IChatUser {
  id: string
  fullname: string
  email: string
  profile: string
  role: string
}

interface IChatParticipant {
  id: string
  user_id: string
  user: IChatUser
  joined_at: string
}

interface IChatReadBy {
  user_id: string
  fullname: string
  read_at: string
}

interface IChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender: IChatUser
  type: string
  content: string
  created_at: string
  read_by: IChatReadBy[]
}

interface IChatConversation {
  id: string
  name: string
  type: string
  participants: IChatParticipant[]
  last_message: IChatMessage | null
  unread_count: number
  last_message_at: string | null
  updated_at: string
  created_at: string
}

interface IWebSocketMessage {
  type: string
  token?: string
  conversation_id?: string
  content?: string
  message_id?: string
}
