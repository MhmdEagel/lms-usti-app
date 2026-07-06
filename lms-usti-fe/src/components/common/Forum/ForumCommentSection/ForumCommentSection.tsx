"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createForumComment } from "@/actions/create-forum-comment";
import { deleteForumComment } from "@/actions/delete-forum-comment";
import ContentEditor from "@/components/ui/content-editor";
import CommentItem from "../../MaterialDetail/Comment/CommentItem";
import type { IComment } from "@/types/Classroom";

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
  const [comments, setComments] = useState<IComment[]>(initialComments ?? []);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim() || content === "<p></p>") return;
    setSubmitting(true);
    const res = await createForumComment(postId, { content });
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
    const res = await deleteForumComment(postId, commentId);
    setDeletingId(null);
    if (res.success) {
      toast.success(res.success);
    } else if (res.error) {
      toast.error(res.error);
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
        <p className="text-gray-400 text-center py-4">Belum ada komentar.</p>
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
