import AssignmentDetail from "@/components/common/AssignmentDetail";
import AssignmentDetailSkeleton from "@/components/common/AssignmentDetail/AssignmentDetailSkeleton";
import { Suspense } from "react";

export default async function DetailTugasPage({
  params,
}: {
  params: Promise<{ classroomId: string; assignmentId: string }>;
}) {
  const { classroomId, assignmentId } = await params;

  return (
    <Suspense fallback={<AssignmentDetailSkeleton type="mahasiswa" />}>
      <AssignmentDetail
        classroomId={classroomId}
        assignmentId={assignmentId}
        type="mahasiswa"
      />
    </Suspense>
  );
}
