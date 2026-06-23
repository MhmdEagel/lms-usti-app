import ClassroomAnnouncement from "@/components/views/Dashboard/DashboardDosen/Classroom/Announcement/ClassroomAnnouncement";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  return <ClassroomAnnouncement classroomId={classroomId} />;
}
