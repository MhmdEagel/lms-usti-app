import MaterialDetail from "@/components/common/MaterialDetail/MaterialDetail";

export default async function ProdiMateriDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string; materiId: string }>;
}) {
  const { classroomId, materiId } = await params;

  return <MaterialDetail classroomId={classroomId} materiId={materiId} />;
}
