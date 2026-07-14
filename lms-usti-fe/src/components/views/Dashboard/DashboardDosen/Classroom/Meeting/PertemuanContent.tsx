import { meetingServices } from "@/services/meeting.service";
import { getCurrentUser } from "@/lib/auth";
import PertemuanTabNavigation from "./PertemuanTabNavigation";
import MeetingCard from "./MeetingCard";
import CreateMeetingDialog from "./CreateMeetingDialog/CreateMeetingDialog";
import type { IMeeting } from "@/types/Classroom";

interface PropTypes {
  classroomId: string;
}

export default async function PertemuanContent({ classroomId }: PropTypes) {
  const user = await getCurrentUser();
  const type = user.role.toLowerCase() as "dosen" | "mahasiswa";
  const res = await meetingServices.getMeetings(classroomId);
  const meetings: IMeeting[] = res.data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b-1 pb-4">
        <div>
          <h2 className="text-lg font-semibold">Pertemuan</h2>
        </div>
        {user.role === "DOSEN" && (
          <CreateMeetingDialog classroomId={classroomId} />
        )}
      </div>

      <PertemuanTabNavigation classroomId={classroomId} type={type} />

      <div className="mt-4 space-y-3">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              type={type}
              classroomId={classroomId}
            />
          ))
        ) : (
          <div className="h-32 flex justify-center items-center text-muted-foreground">
            Belum ada pertemuan
          </div>
        )}
      </div>
    </div>
  );
}
