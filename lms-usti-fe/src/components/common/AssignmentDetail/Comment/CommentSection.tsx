"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { createComment } from "@/actions/create-comment";
import { deleteComment } from "@/actions/delete-comment";
import ContentEditor from "@/components/ui/content-editor";
import CommentItem from "@/components/common/MaterialDetail/Comment/CommentItem";
import type { IComment } from "@/types/Classroom";

interface PropTypes {
  initialComments: IComment[];
  currentUserId: string;
  currentRole: string;
}

export default function CommentSection({
  initialComments,
  currentUserId,
  currentRole,
}: PropTypes) {
  const params = useParams();
  const pathname = usePathname();
  const classroomId = params.classroomId as string;
  const assignmentId = params.assignmentId as string;

  const [comments, setComments] = useState<IComment[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleSubmit = async () => {
    if (!content.trim() || content === "<p></p>") return;
    setSubmitting(true);
    const res = await createComment(
      classroomId,
      assignmentId,
      { content },
      pathname,
      "assignment",
    );
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
    const res = await deleteComment(
      classroomId,
      assignmentId,
      commentId,
      pathname,
      "assignment",
    );
    setDeletingId(null);
    if (res.success) {
      toast.success(res.success);
    } else if (res.error) {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Komentar</h2>
      </div>

      <div className="space-y-2">
        <ContentEditor
          onChange={setContent}
          isInvalid={false}
          placeholder="Tulis komentar..."
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Mengirim..." : "Kirim"}
          </Button>
        </div>
      </div>

      <div className="border-t pt-4">
        {comments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            Belum ada komentar.
          </p>
        ) : (
          <div className="space-y-6">
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
