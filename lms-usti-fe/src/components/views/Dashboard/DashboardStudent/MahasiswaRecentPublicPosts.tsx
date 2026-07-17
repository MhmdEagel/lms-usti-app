import Link from "next/link"
import { MessageSquare, Pin, ChevronRight } from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/id"
import { forumServices } from "@/services/forum.service"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { environtment } from "@/config/environtment"

dayjs.extend(relativeTime)
dayjs.locale("id")

export default async function MahasiswaRecentPublicPosts() {
  const res = await forumServices.getPosts()
  const allPosts = res.data?.data as IForumPost[] | undefined

  const twentyFourHoursAgo = dayjs().subtract(24, "hour")
  const posts = allPosts
    ? allPosts
        .filter((post) => dayjs(post.created_at).isAfter(twentyFourHoursAgo))
        .sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix())
        .slice(0, 5)
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <MessageSquare size={20} className="sm:size-6" />
          Forum Publik Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada postingan terbaru</p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto flex flex-col gap-3 pr-1">
            {posts.map((post) => (
              <Link key={post.id} href={`/mahasiswa/forum/${post.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 shrink-0">
                        <AvatarImage
                          src={`${environtment.API_URL}/media/profiles/${post.author_profile}`}
                          alt={post.author_name}
                        />
                        <AvatarFallback>
                          {post.author_name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {post.is_pinned && <Pin size={14} className="shrink-0 fill-primary text-primary" />}
                          <p className="font-medium text-sm truncate">{post.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{post.author_name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{dayjs(post.created_at).fromNow()}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {post.comment_count}
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
