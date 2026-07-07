import ClassroomForumPostSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomDetailForum/ClassroomForumPostSkeleton/ClassroomForumPostSkeleton";
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
      <Suspense fallback={<ClassroomForumPostSkeleton />}>
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
