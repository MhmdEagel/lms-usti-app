import ClassroomForum from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomForum/ClassroomForum";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  return <ClassroomForum classroomId={classroomId} />;
}
