import AnnouncementSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/Announcement/AnnouncementSkeleton/AnnouncementSkeleton";
import ClassroomAnnouncement from "@/components/views/Dashboard/DashboardDosen/Classroom/Announcement/ClassroomAnnouncement";
import { Suspense } from "react";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  return (
    <>
      <Suspense fallback={<AnnouncementSkeleton />}>
        <ClassroomAnnouncement classroomId={classroomId} />
      </Suspense>
    </>
  );
}
