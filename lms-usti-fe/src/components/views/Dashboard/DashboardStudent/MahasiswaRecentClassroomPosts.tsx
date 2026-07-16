import Link from "next/link"
import { MessageSquare, Pin, ChevronRight } from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/id"
import { classroomServices } from "@/services/classroom.service"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { environtment } from "@/config/environtment"
import type { IClassroomForumPost } from "@/types/Classroom"

dayjs.extend(relativeTime)
dayjs.locale("id")

export default async function MahasiswaRecentClassroomPosts() {
  const classroomsRes = await classroomServices.findAllMahasiswaClassrooms({ limit: 50 })
  const classrooms = classroomsRes.data?.data ?? []

  const allPosts: (IClassroomForumPost & { classroom_id: string })[] = []

  for (const cls of classrooms) {
    try {
      const postsRes = await classroomServices.getForumPosts(cls.id, { limit: 10 })
      const posts: IClassroomForumPost[] = postsRes.data?.data ?? []
      allPosts.push(
        ...posts.map((p) => ({ ...p, classroom_id: cls.id }))
      )
    } catch {
      // skip classroom on error
    }
  }

  const twentyFourHoursAgo = dayjs().subtract(24, "hour")
  const recentPosts = allPosts
    .filter((post) => dayjs(post.created_at).isAfter(twentyFourHoursAgo))
    .sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <MessageSquare size={20} className="sm:size-6" />
          Forum Kelas Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentPosts.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada postingan terbaru</p>
        ) : (
          <div className="max-h-[320px] overflow-y-auto space-y-3">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/mahasiswa/kelas/${post.classroom_id}/forum/${post.id}`}
              >
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 shrink-0">
                        <AvatarImage
                          src={`${environtment.API_URL}/media/profiles/${post.created_by}`}
                          alt={post.classroom_name}
                        />
                        <AvatarFallback>
                          {post.classroom_name?.charAt(0)?.toUpperCase() || "K"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {post.is_pinned && <Pin size={14} className="shrink-0 fill-primary text-primary" />}
                          <p className="font-medium text-sm truncate">{post.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{post.classroom_name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{dayjs(post.created_at).fromNow()}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {post.comment_count ?? 0}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="shrink-0 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
