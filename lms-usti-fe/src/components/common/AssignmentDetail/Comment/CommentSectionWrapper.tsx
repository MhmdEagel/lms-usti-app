"use client";

import dynamic from "next/dynamic";
import type { IComment } from "@/types/Classroom";

const CommentSection = dynamic(
  () => import("@/components/common/AssignmentDetail/Comment/CommentSection"),
  {
    ssr: false,
  },
);

interface PropTypes {
  initialComments: IComment[];
  currentId: string;
  currentRole: string;
}

export default function CommentSectionWrapper({
  initialComments,
  currentId,
  currentRole,
}: PropTypes) {
  return (
    <CommentSection
      initialComments={initialComments}
      currentId={currentId}
      currentRole={currentRole}
    />
  );
}
