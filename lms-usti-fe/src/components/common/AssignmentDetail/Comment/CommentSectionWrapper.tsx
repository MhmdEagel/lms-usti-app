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
  currentUserId: string;
  currentRole: string;
}

export default function CommentSectionWrapper({
  initialComments,
  currentUserId,
  currentRole,
}: PropTypes) {
  return (
    <CommentSection
      initialComments={initialComments}
      currentUserId={currentUserId}
      currentRole={currentRole}
    />
  );
}
