import AssignmentDetail from "@/components/common/AssignmentDetail";
import AssignmentDetailSkeleton from "@/components/common/AssignmentDetail/AssignmentDetailSkeleton";
import { Suspense } from "react";

export default async function ProdiDetailTugasPage({
  params,
}: {
  params: Promise<{ classroomId: string; assignmentId: string }>;
}) {
  const { classroomId, assignmentId } = await params;
  return (
    <Suspense fallback={<AssignmentDetailSkeleton type="prodi" />}>
      <AssignmentDetail
        classroomId={classroomId}
        assignmentId={assignmentId}
        type="prodi"
      />
    </Suspense>
  );
}
