"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createAnnouncementComment } from "@/actions/create-forum-post-comment";
import { deleteAnnouncementComment } from "@/actions/delete-forum-post-comment";
import ContentEditor from "@/components/ui/content-editor";
import CommentItem from "@/components/common/MaterialDetail/Comment/CommentItem";
import type { IComment, IClassroomDetailForum } from "@/types/Classroom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon, ArrowLeft } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";

interface PropTypes {
  announcement: IClassroomDetailForum;
  initialComments: IComment[];
  classroomId: string;
  currentUserId: string;
  currentRole: string;
}

export default function AnnouncementDetailSection({
  announcement,
  initialComments,
  classroomId,
  currentUserId,
  currentRole,
}: PropTypes) {
  const [comments, setComments] = useState<IComment[]>(initialComments ?? []);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim() || content === "<p></p>") return;
    setSubmitting(true);
    const res = await createAnnouncementComment(classroomId, announcement.id, { content });
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
    const res = await deleteAnnouncementComment(classroomId, announcement.id, commentId);
    setDeletingId(null);
    if (res.success) {
      toast.success(res.success);
    } else if (res.error) {
      toast.error(res.error);
    }
  };

  const rolePath = currentRole?.toLowerCase() ?? "dosen";

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Link
        href={`/${rolePath}/kelas/${classroomId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Forum Kelas
      </Link>

      <div className="flex items-center gap-2 mb-4">
        <Avatar className="size-10">
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="text-primary font-bold">{announcement.created_by}</div>
          <div className="text-muted-foreground text-sm">{announcement.created_at}</div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">{announcement.title}</h1>

      <div
        className="prose max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(announcement.content) }}
      />

      <div className="space-y-4 pt-4 border-t mt-4">
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

        {comments.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Belum ada komentar.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
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
