import { getCurrentUser } from "@/lib/auth";
import AssignmentHeader from "./AssignmentHeader/AssignmentHeader";
import AssignmentItem from "./AssignmentItem/AssignmentItem";
import { assignmentServices } from "@/services/assignment.service";
import { IAssignment } from "@/types/Classroom";

export default async function Assignment({ classroomId }: { classroomId: string }) {
  const user = await getCurrentUser();
  const res = await assignmentServices.findAllAssignments(classroomId);
  const listAssignment: IAssignment[] | null = res.data?.data;

  return (
    <>
      <AssignmentHeader classroomId={classroomId} userRole={user?.role} />
      <div className="mt-4 space-y-4">
        {listAssignment && listAssignment.length > 0 ? (
          listAssignment.map((item) => (
            <AssignmentItem
              key={item.id}
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
    </>
  );
}