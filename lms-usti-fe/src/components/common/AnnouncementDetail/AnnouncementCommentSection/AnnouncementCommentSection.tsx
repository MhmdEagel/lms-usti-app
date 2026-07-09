"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createAnnouncementComment } from "@/actions/create-announcement-comment";
import { deleteAnnouncementComment } from "@/actions/delete-announcement-comment";
import ContentEditor from "@/components/ui/content-editor";
import CommentItem from "../../MaterialDetail/Comment/CommentItem";
import type { IComment } from "@/types/Classroom";

interface PropTypes {
  classroomId: string;
  announcementId: string;
  initialComments: IComment[];
  currentId: string;
  currentRole: string;
  commentPermission: string;
  forumPermission?: string;
}

export default function AnnouncementCommentSection({
  classroomId,
  announcementId,
  initialComments,
  currentId,
  currentRole,
  commentPermission,
  forumPermission = "comment_only",
}: PropTypes) {
  const [comments, setComments] = useState<IComment[]>(initialComments ?? []);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isCommentDisabled = currentRole === "MAHASISWA" && (commentPermission === "inactive" || forumPermission === "dosen_only");

  const handleSubmit = async () => {
    if (!content.trim() || content === "<p></p>") return;
    setSubmitting(true);
    const res = await createAnnouncementComment(classroomId, announcementId, { content });
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
    const res = await deleteAnnouncementComment(classroomId, announcementId, commentId);
    setDeletingId(null);
    if (res.success) {
      toast.success(res.success);
    } else if (res.error) {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t mt-4">
      {isCommentDisabled ? (
        <p className="text-gray-400 text-center py-4">Komentar dinonaktifkan untuk kelas ini.</p>
      ) : (
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
              currentId={currentId}
              currentRole={currentRole}
              onDelete={handleDelete}
              isDeleting={deletingId === comment.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
