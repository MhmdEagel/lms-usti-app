import { getCurrentUser } from "@/lib/auth";
import AssignmentHeader from "./AssignmentHeader/AssignmentHeader";
import AssignmentItem from "./AssignmentItem/AssignmentItem";
import { assignmentServices } from "@/services/assignment.service";
import { IAssignment } from "@/types/Classroom";
import PaginationControls from "@/components/common/PaginationControls/PaginationControls";
import PaginationNav from "@/components/common/PaginationControls/PaginationNav";

export default async function Assignment({
  classroomId,
  type = "dosen",
  page = 1,
  limit = 10,
}: {
  classroomId: string;
  type?: "dosen" | "mahasiswa";
  page?: number;
  limit?: number;
}) {
  const user = await getCurrentUser();
  const res = await assignmentServices.findAllAssignments(classroomId, { page, limit });
  const pagination: PaginationInfo = res.data?.pagination;
  const listAssignment: IAssignment[] | null = res.data?.data;

  return (
    <>
      <AssignmentHeader classroomId={classroomId} userRole={user?.role} />
      <div className="mt-4 flex flex-col gap-4">
        {listAssignment && listAssignment.length > 0 ? (
          listAssignment.map((item) => (
            <AssignmentItem
              key={item.id}
              type={type}
              classroomId={classroomId}
              assignmentId={item.id!}
              title={item.title}
              deadline={item.deadline!}
            />
          ))
        ) : (
          <div className="h-32 flex justify-center items-center">
            Belum ada tugas yang ditambahkan
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