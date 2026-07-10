import { getCurrentUser } from "@/lib/auth"
import ChatPage from "@/components/common/Chat/ChatPage"
import { getAccessToken } from "@/actions/get-token"
import { createMetadata } from "@/lib/metadata"

export const generateMetadata = () => createMetadata({ title: "Percakapan" })

export default async function ProdiPercakapanPage() {
  const user = await getCurrentUser()
  const token = await getAccessToken()
  return <ChatPage user={user} token={token || ""} />
}
