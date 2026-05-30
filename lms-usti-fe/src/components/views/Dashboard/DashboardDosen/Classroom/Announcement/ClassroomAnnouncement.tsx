import AddAnnouncement from "./AddAnnouncement/AddAnnouncement";
import AnnouncementItem from "./AnnouncementItem/AnnouncementItem";
import { getCurrentUser } from "@/lib/auth";
import { classroomServices } from "@/services/classroom.service";
import { IAnnouncement } from "@/types/Classroom";

export default async function ClassroomAnnouncement({
  classroomId,
}: {
  classroomId: string;
}) {
  const user = await getCurrentUser();
  const res = await classroomServices.getAnnouncement(classroomId);
  const listPengumuman: IAnnouncement[] = res.data.data;

  console.log(classroomId)


  if (listPengumuman && listPengumuman?.length > 0) {
    return (
      <>
        <AddAnnouncement
          userRole={user.data?.role}
          classroomId={classroomId}
          userId={user?.id}
        />
        <div className="mt-4">
          {listPengumuman.map((pengumuman) => (
            <AnnouncementItem
              key={pengumuman.id}
              createdBy={pengumuman.created_by}
              content={pengumuman.content}
              annId={pengumuman.id}
              classroomId={classroomId}
            />
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <AddAnnouncement
        userId={user?.id}
        userRole={user?.role}
        classroomId={classroomId}
      />
      <div className="h-32 flex justify-center items-center text-center">
        Belum ada pengumuman kelas.
      </div>
    </>
  );
}
