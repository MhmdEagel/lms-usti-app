import { commentServices } from "@/services/comment.service";
import CommentSectionWrapper from "./CommentSectionWrapper";
import type { IComment } from "@/types/Classroom";

interface PropTypes {
  classroomId: string;
  materiId: string;
  currentId: string;
  currentRole: string;
}

export default async function CommentSectionData({
  classroomId,
  materiId,
  currentId,
  currentRole,
}: PropTypes) {
  const res = await commentServices.getComments(classroomId, materiId);
  const initialComments: IComment[] = res.data?.data ?? [];

  return (
    <CommentSectionWrapper
      initialComments={initialComments}
      currentId={currentId}
      currentRole={currentRole}
    />
  );
}
