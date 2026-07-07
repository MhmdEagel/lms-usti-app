import ForumSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomDetailForum/ForumSkeleton/ForumSkeleton";
import ClassroomDetailForum from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomDetailForum/ClassroomDetailForum";
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
      <Suspense fallback={<ForumSkeleton />}>
        <ClassroomDetailForum
          classroomId={classroomId}
          page={page ? Number(page) : 1}
          limit={limit ? Number(limit) : 10}
          search={search || ""}
        />
      </Suspense>
    </>
  );
}
