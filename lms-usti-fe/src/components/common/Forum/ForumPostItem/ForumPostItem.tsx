"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Pin, Trash2 } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { deleteForumPost } from "@/actions/delete-forum-post";
import { toast } from "sonner";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

dayjs.extend(relativeTime);
dayjs.locale("id");

interface PropTypes {
  post: IForumPost;
  currentId: string;
  currentRole: string;
}

export default function ForumPostItem({ post, currentId, currentRole }: PropTypes) {
  const initials = post.author_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const canDelete = currentRole === "PRODI" || post.created_by === currentId;
  const forumPath = `/${currentRole.toLowerCase()}/forum/${post.id}`;

  const handleDelete = async () => {
    const res = await deleteForumPost(post.id);
    if (res.success) {
      toast.success(res.success);
    } else if (res.error) {
      toast.error(res.error);
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="size-10">
              <AvatarImage src={post.author_profile} alt={post.author_name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold">{post.author_name}</div>
              <div className="text-xs text-gray-500">
                {dayjs(post.created_at).fromNow()}
              </div>
            </div>
            {post.is_pinned && (
              <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                <Pin className="size-3" />
                Pinned
              </div>
            )}
          </div>
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Postingan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus postingan ini? Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold mt-2">{post.title}</div>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
        <div className="mt-4">
          <Link href={forumPath} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <MessageSquare className="h-4 w-4" />
            {post.comment_count > 0 ? post.comment_count : "0"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
