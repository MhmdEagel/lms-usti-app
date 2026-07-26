"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pin } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ForumCommentSection from "@/components/common/Forum/ForumCommentSection/ForumCommentSection";

dayjs.extend(relativeTime);
dayjs.locale("id");

interface PropTypes {
  post: IForumPostDetail;
  currentId: string;
  currentRole: string;
}

export default function ForumPostDetail({ post, currentId, currentRole }: PropTypes) {
  const initials = post.author_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-4">
      <Link className="mb-2" href={`/${currentRole.toLowerCase()}/forum`}>
        <Button className="rounded-full" variant="ghost">
          <ArrowLeft /> Kembali
        </Button>
      </Link>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Avatar className="size-10">
              <AvatarImage src={post.author_profile} alt={post.author_name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold">{post.author_name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={"text-[10px] font-semibold px-1.5 py-0.5 rounded " + (post.author_role === "DOSEN" ? "bg-blue-100 text-blue-700" : post.author_role === "MAHASISWA" ? "bg-green-100 text-green-700" : post.author_role === "PRODI" ? "bg-purple-100 text-purple-700" : post.author_role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground")}>{post.author_role}</span>
                <span className="text-xs text-muted-foreground">{dayjs(post.created_at).fromNow()}</span>
              </div>
            </div>
            {post.is_pinned && (
              <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                <Pin className="size-3" />
                Pinned
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="text-base sm:text-lg font-bold mt-2">{post.title}</div>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
        </CardContent>
      </Card>

      <ForumCommentSection
        postId={post.id}
        initialComments={post.comments}
        currentId={currentId}
        currentRole={currentRole}
      />
    </div>
  );
}
