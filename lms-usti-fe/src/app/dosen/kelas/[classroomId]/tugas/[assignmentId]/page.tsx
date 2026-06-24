import AssignmentDetail from "@/components/common/AssignmentDetail";

export default async function TugasDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string; assignmentId: string }>;
}) {
  const { classroomId, assignmentId } = await params;

  return <AssignmentDetail classroomId={classroomId} assignmentId={assignmentId} />;
}
