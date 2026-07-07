"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createForumPostComment } from "@/actions/create-forum-post-comment";
import { deleteForumPostComment } from "@/actions/delete-forum-post-comment";
import ContentEditor from "@/components/ui/content-editor";
import CommentItem from "@/components/common/MaterialDetail/Comment/CommentItem";
import type { IComment, IClassroomForumPost } from "@/types/Classroom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Pin } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

interface PropTypes {
  announcement: IClassroomForumPost;
  initialComments: IComment[];
  classroomId: string;
  currentUserId: string;
  currentRole: string;
  forumPermission?: string;
}

export default function ClassroomForumPostDetailSection({
  announcement,
  initialComments,
  classroomId,
  currentUserId,
  currentRole,
  forumPermission = "comment_only",
}: PropTypes) {
  const [comments, setComments] = useState<IComment[]>(initialComments ?? []);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim() || content === "<p></p>") return;
    setSubmitting(true);
    const res = await createForumPostComment(classroomId, announcement.id, {
      content,
    });
    setContent("");
    setSubmitting(false);
    if (res.success) {
      toast.success(res.success);
    } else if (res.error) {
      toast.error(res.error);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    const res = await deleteForumPostComment(
      classroomId,
      announcement.id,
      commentId,
    );
    setDeletingId(null);
    if (res.success) {
      toast.success(res.success);
    } else if (res.error) {
      toast.error(res.error);
    }
  };

  const rolePath = currentRole?.toLowerCase() ?? "dosen";
  const canComment = currentRole === "DOSEN" || (currentRole === "MAHASISWA" && forumPermission !== "dosen_only");

  const initials = announcement.created_by
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-4 p-4">
      <Link href={`/${rolePath}/kelas/${classroomId}`}>
        <Button className="rounded-full" variant="ghost">
          <ArrowLeft /> Kembali
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Avatar className="size-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold">
                {announcement.created_by}
              </div>
              <div className="text-xs text-gray-500">
                {dayjs(announcement.created_at).fromNow()}
              </div>
            </div>
            {announcement.is_pinned && (
              <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full ml-auto">
                <Pin className="size-3" />
                Pinned
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-base font-bold mt-2">{announcement.title}</div>
          <div
            className="prose max-w-none mt-2"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(announcement.content),
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-4 pt-4 border-t mt-4">
        {canComment && (
          <div className="space-y-2">
            <ContentEditor
              onChange={setContent}
              isInvalid={false}
              placeholder="Tambahkan komentar..."
              className="min-h-[60px]"
              autoFocus={false}
              showToolbarOnFocus
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Mengirim..." : "Kirim"}
              </Button>
            </div>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Belum ada komentar.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentId={currentUserId}
                currentRole={currentRole}
                onDelete={handleDelete}
                isDeleting={deletingId === comment.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
