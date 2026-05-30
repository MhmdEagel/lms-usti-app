import MaterialDetail from "@/components/common/MaterialDetail/MaterialDetail";

export default async function MateriDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string; materiId: string }>;
}) {
  const { classroomId, materiId } = await params;

  return <MaterialDetail classroomId={classroomId} materiId={materiId} />;
}
