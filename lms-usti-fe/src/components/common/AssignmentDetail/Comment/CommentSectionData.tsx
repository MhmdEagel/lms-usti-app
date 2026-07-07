import { commentServices } from "@/services/comment.service";
import CommentSectionWrapper from "./CommentSectionWrapper";
import type { IComment } from "@/types/Classroom";

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  currentId: string;
  currentRole: string;
}

export default async function CommentSectionData({
  classroomId,
  assignmentId,
  currentId,
  currentRole,
}: PropTypes) {
  const res = await commentServices.getAssignmentComments(classroomId, assignmentId);
  const initialComments: IComment[] = res.data?.data ?? [];

  return (
    <CommentSectionWrapper
      initialComments={initialComments}
      currentId={currentId}
      currentRole={currentRole}
    />
  );
}
