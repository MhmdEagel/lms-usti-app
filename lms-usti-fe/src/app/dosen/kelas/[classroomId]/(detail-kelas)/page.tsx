import ForumSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomDetailForum/ForumSkeleton/ForumSkeleton";
import ClassroomDetailForum from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomDetailForum/ClassroomDetailForum";
import { Suspense } from "react";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  return (
    <>
      <Suspense fallback={<ForumSkeleton />}>
        <ClassroomDetailForum classroomId={classroomId} />
      </Suspense>
    </>
  );
}
