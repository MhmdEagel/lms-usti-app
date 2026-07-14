import { Suspense } from "react";
import PertemuanContent from "@/components/views/Dashboard/DashboardDosen/Classroom/Meeting/PertemuanContent";
import PertemuanSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/Meeting/PertemuanSkeleton";

export default async function PertemuanPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;

  return (
    <Suspense fallback={<PertemuanSkeleton />}>
      <PertemuanContent classroomId={classroomId} />
    </Suspense>
  );
}
