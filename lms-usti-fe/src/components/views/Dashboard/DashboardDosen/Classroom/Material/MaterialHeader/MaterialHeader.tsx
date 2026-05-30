import CreateMaterialDialog from "../CreateMaterialDialog/CreateMaterialDialog";

export default function MaterialHeader({
  userRole,
  classroomId,
}: {
  userRole: string | undefined;
  classroomId: string;
}) {
  return (
    <>
      <div className="pb-4 border-b-2 flex items-center">
        <div className="text-base md:text-xl font-semibold">Materi Kelas</div>
        {userRole === "DOSEN" ? <CreateMaterialDialog classroomId={classroomId} /> : null}
      </div>
    </>
  );
}
