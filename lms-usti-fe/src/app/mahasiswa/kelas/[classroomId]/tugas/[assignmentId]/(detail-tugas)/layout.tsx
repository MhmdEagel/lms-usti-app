import AssignmentDetailLayout from "@/components/common/AssignmentDetail/AssignmentDetailLayout";

export default async function DetailTugasLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ classroomId: string; assignmentId: string }>;
}) {
  const { classroomId, assignmentId } = await params;

  return (
    <AssignmentDetailLayout
      classroomId={classroomId}
      assignmentId={assignmentId}
      type="mahasiswa"
    >
      {children}
    </AssignmentDetailLayout>
  );
}
