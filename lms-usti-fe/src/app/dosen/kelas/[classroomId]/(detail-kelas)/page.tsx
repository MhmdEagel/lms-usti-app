import ForumSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomForum/ForumSkeleton/ForumSkeleton";
import ClassroomForum from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomForum/ClassroomForum";
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
        <ClassroomForum classroomId={classroomId} />
      </Suspense>
    </>
  );
}
