import { getCurrentUser } from "@/lib/auth";
import AssignmentHeader from "./AssignmentHeader/AssignmentHeader";
import AssignmentItem from "./AssignmentItem/AssignmentItem";
import { assignmentServices } from "@/services/assignment.service";
import { IAssignment } from "@/types/Classroom";
import PaginationControls from "@/components/common/PaginationControls/PaginationControls";
import PaginationNav from "@/components/common/PaginationControls/PaginationNav";
import { SearchBar } from "@/components/ui/searchfield";
import CreateAssignmentDialog from "./CreateAssignmentDialog/CreateAssignmentDialog";

export default async function Assignment({
  classroomId,
  type = "dosen",
  page = 1,
  limit = 10,
  search = "",
  showHeader = true,
}: {
  classroomId: string;
  type?: "dosen" | "mahasiswa";
  page?: number;
  limit?: number;
  search?: string;
  showHeader?: boolean;
}) {
  const user = await getCurrentUser();
  const res = await assignmentServices.findAllAssignments(classroomId, { page, limit, search });
  const pagination: PaginationInfo = res.data?.pagination;
  const listAssignment: IAssignment[] | null = res.data?.data;

  return (
    <>
      {showHeader && <AssignmentHeader />}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <div className="w-full sm:w-auto sm:flex-1">
          <SearchBar placeholder="Cari tugas..." />
        </div>
        {user?.role === "DOSEN" ? <CreateAssignmentDialog classroomId={classroomId} /> : null}
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {listAssignment && listAssignment.length > 0 ? (
          listAssignment.map((item) => (
            <AssignmentItem
              key={item.id}
              type={type}
              classroomId={classroomId}
              assignmentId={item.id!}
              title={item.title}
              deadline={item.deadline}
              stats={item.stats}
              myStatus={item.my_submission_status}
              myScore={item.my_score}
            />
          ))
        ) : (
          <div className="h-32 flex justify-center items-center">
            Belum ada tugas yang ditambahkan
          </div>
        )}
      </div>
      {pagination && (
        <div className="flex flex-wrap gap-2 items-center justify-between mt-4">
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