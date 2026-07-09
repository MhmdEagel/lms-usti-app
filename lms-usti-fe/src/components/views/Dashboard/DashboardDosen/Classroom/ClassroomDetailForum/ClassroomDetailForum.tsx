import AddClassroomForumPost from "./AddClassroomForumPost/AddClassroomForumPost";
import { getCurrentUser } from "@/lib/auth";
import { classroomServices } from "@/services/classroom.service";
import { IClassroomForumPost } from "@/types/Classroom";
import PaginationControls from "@/components/common/PaginationControls/PaginationControls";
import PaginationNav from "@/components/common/PaginationControls/PaginationNav";
import ClassroomForumPostItem from "./ClassroomForumPostItem/ClassroomForumPostItem";

export default async function ClassroomDetailForum({
  classroomId,
  page = 1,
  limit = 10,
  search = "",
  canCreatePost = true,
}: {
  classroomId: string;
  page?: number;
  limit?: number;
  search?: string;
  canCreatePost?: boolean;
}) {
  const user = await getCurrentUser();
  const res = await classroomServices.getForumPosts(classroomId, { page, limit, search });
  const pagination: PaginationInfo = res.data?.pagination;
  const listPengumuman: IClassroomForumPost[] | null = res.data?.data;

  

  return (
    <>
      <AddClassroomForumPost
        classroomId={classroomId}
        id={user?.id}
        canCreatePost={canCreatePost}
      />
      <div className="mt-4 flex flex-col gap-4">
        {listPengumuman && listPengumuman.length > 0 ? (
          listPengumuman.map((pengumuman) => (
            <ClassroomForumPostItem
              key={pengumuman.id}
              announcement={pengumuman}
              classroomId={classroomId}
              userRole={user?.role}
            />
          ))
        ) : (
          <div className="h-32 flex justify-center items-center text-center">
            Belum ada forum kelas.
          </div>
        )}
      </div>
      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <PaginationControls
            current={pagination.current}
            limit={pagination.limit}
          />
          <PaginationNav
            current={pagination.current}
            totalPages={pagination.total_pages}
            total={pagination.total}
            limit={pagination.limit}
          />
        </div>
      )}
    </>
  );
}
