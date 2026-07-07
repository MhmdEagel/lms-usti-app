import ClassroomDetailForum from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomDetailForum/ClassroomDetailForum";
import { classroomServices } from "@/services/classroom.service";

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ classroomId: string }>;
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const { classroomId } = await params;
  const { page, limit, search } = await searchParams;
  const policiesRes = await classroomServices.getPolicies(classroomId);
  const forumPermission: string = policiesRes.data?.data?.forum_permission ?? "comment_only";
  const canCreatePost = forumPermission === "full_access";

  return (
    <ClassroomDetailForum
      classroomId={classroomId}
      page={page ? Number(page) : 1}
      limit={limit ? Number(limit) : 10}
      search={search || ""}
      canCreatePost={canCreatePost}
    />
  );
}
