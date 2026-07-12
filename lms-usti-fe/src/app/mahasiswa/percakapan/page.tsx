import { getCurrentUser } from "@/lib/auth"
import ChatPage from "@/components/common/Chat/ChatPage"
import { getAccessToken } from "@/actions/get-token"
import { createMetadata } from "@/lib/metadata"

export const generateMetadata = () => createMetadata({ title: "Percakapan" })

export default async function MahasiswaPercakapanPage(props: { searchParams?: Promise<{ conversationId?: string }> }) {
  const searchParams = await props.searchParams
  const user = await getCurrentUser()
  const token = await getAccessToken()
  return <ChatPage user={user} token={token || ""} initialConversationId={searchParams?.conversationId} />
}
