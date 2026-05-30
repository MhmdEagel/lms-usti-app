import Material from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/Material";

export default async function MateriPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  return (
    <Material classroomId={classroomId} />
  )
}
