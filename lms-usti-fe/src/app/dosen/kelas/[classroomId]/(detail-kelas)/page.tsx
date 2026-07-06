import AnnouncementSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/Announcement/AnnouncementSkeleton/AnnouncementSkeleton";
import ClassroomAnnouncement from "@/components/views/Dashboard/DashboardDosen/Classroom/Announcement/ClassroomAnnouncement";
import { Suspense } from "react";

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ classroomId: string }>;
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const { classroomId } = await params;
  const { page, limit, search } = await searchParams;
  return (
    <>
      <Suspense fallback={<AnnouncementSkeleton />}>
        <ClassroomAnnouncement
          classroomId={classroomId}
          page={page ? Number(page) : 1}
          limit={limit ? Number(limit) : 10}
          search={search || ""}
        />
      </Suspense>
    </>
  );
}
