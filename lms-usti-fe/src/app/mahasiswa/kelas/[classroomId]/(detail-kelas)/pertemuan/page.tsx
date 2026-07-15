import { Suspense } from "react";
import MeetingContent from "@/components/views/Dashboard/DashboardDosen/Classroom/Meeting/MeetingContent";
import MeetingSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/Meeting/MeetingSkeleton";

export default async function MahasiswaPertemuanPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;

  return (
    <Suspense fallback={<MeetingSkeleton />}>
      <MeetingContent classroomId={classroomId} />
    </Suspense>
  );
}
