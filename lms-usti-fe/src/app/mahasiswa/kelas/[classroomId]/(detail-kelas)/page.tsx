import ClassroomDetailForum from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomDetailForum/ClassroomDetailForum";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  return <ClassroomDetailForum classroomId={classroomId} />;
}
