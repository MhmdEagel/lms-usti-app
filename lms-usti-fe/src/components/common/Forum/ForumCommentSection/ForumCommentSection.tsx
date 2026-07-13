"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { forumServices } from "@/services/forum.service";
import ContentEditor from "@/components/ui/content-editor";
import CommentItem from "../../MaterialDetail/Comment/CommentItem";
import type { IComment } from "@/types/Classroom";
import { useRouter } from "next/navigation";

interface PropTypes {
  postId: string;
  initialComments: IComment[];
  currentId: string;
  currentRole: string;
}

export default function ForumCommentSection({
  postId,
  initialComments,
  currentId,
  currentRole,
}: PropTypes) {
  const router = useRouter();
  const [comments, setComments] = useState<IComment[]>(initialComments ?? []);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim() || content === "<p></p>") return;
    setSubmitting(true);
    try {
      await forumServices.createComment(postId, { content });
      setContent("");
      toast.success("Komentar berhasil dibuat");
      router.refresh();
    } catch {
      toast.error("Gagal membuat komentar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      await forumServices.deleteComment(postId, commentId);
      toast.success("Komentar berhasil dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus komentar");
    } finally {
      setDeletingId(null);
    }
  };

  return (
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

      {comments && comments.length === 0 ? (
        <p className="text-muted-foreground text-center py-4 text-sm">Belum ada komentar.</p>
      ) : (
        <div className="space-y-4">
          {comments && comments.map((comment) => (
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
