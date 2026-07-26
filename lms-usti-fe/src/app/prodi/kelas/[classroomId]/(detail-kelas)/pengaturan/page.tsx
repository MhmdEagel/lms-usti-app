import ClassSettings from "@/components/views/Dashboard/DashboardDosen/ClassSettings/ClassSettings";

export default async function ProdiPengaturanPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  return <ClassSettings classroomId={classroomId} />;
}
