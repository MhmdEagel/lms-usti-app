import CreateAssignmentDialog from "../CreateAssignmentDialog/CreateAssignmentDialog";

export default function AssignmentHeader({
  userRole,
  classroomId,
}: {
  userRole: string | undefined;
  classroomId: string;
}) {
  return (
    <>
      <div className="pb-4 border-b-2 flex items-center">
        <div className="text-base md:text-xl font-semibold">Tugas Kelas</div>
        {userRole === "DOSEN" ? <CreateAssignmentDialog classroomId={classroomId} /> : null}
      </div>
    </>
  );
}