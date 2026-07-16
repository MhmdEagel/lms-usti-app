import { Suspense } from "react";
import MeetingContent from "@/components/views/Dashboard/DashboardDosen/Classroom/Meeting/MeetingContent";
import MeetingSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/Meeting/MeetingSkeleton";

export default async function PertemuanPage({
  params,
  searchParams,
}: {
  params: Promise<{ classroomId: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { classroomId } = await params;
  const { search } = await searchParams;

  return (
    <Suspense fallback={<MeetingSkeleton />}>
      <MeetingContent classroomId={classroomId} search={search} />
    </Suspense>
  );
}
