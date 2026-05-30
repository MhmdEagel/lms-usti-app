import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ClassroomCount() {
    const user = await getCurrentUser()
    if(!user) redirect("/auth/login")
    
  return (
    <p className="font-normal">99</p>
  )
}
