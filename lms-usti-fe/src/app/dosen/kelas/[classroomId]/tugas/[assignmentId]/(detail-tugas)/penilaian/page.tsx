import AssignmentDetailGrading from "@/components/common/AssignmentDetail/AssignmentDetailGrading/AssignmentDetailGrading";

export default async function PenilaianPage({
  params,
}: {
  params: Promise<{ classroomId: string; assignmentId: string }>;
}) {
  const { classroomId, assignmentId } = await params;
  return (
    <AssignmentDetailGrading classroomId={classroomId} assignmentId={assignmentId} />
  );
}
