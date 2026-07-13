"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { commentServices } from "@/services/comment.service";
import ContentEditor from "@/components/ui/content-editor";
import CommentItem from "@/components/common/MaterialDetail/Comment/CommentItem";
import type { IComment } from "@/types/Classroom";
import { useRouter } from "next/navigation";

interface PropTypes {
  initialComments: IComment[];
  currentId: string;
  currentRole: string;
}

export default function CommentSection({
  initialComments,
  currentId,
  currentRole,
}: PropTypes) {
  const router = useRouter();
  const params = useParams();
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
    try {
      await commentServices.createAssignmentComment(classroomId, assignmentId, { content });
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
      await commentServices.deleteAssignmentComment(classroomId, assignmentId, commentId);
      toast.success("Komentar berhasil dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus komentar");
    } finally {
      setDeletingId(null);
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
                currentId={currentId}
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
