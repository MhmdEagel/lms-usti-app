import { classroomServices } from "@/services/classroom.service";
import { getTimeString } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import WeeklyScheduleClient from "./WeeklyScheduleClient";

export default async function WeeklySchedule() {
  const user = await getCurrentUser();
  if (!user) return null;

  let scheduleRes;
  if (user.role === "DOSEN") {
    scheduleRes = await classroomServices.findAllDosenClassrooms({ limit: 9999 });
  } else {
    scheduleRes = await classroomServices.findAllMahasiswaClassrooms({ limit: 9999 });
  }
  const classrooms = scheduleRes.data?.data ?? [];
  const events = Array.isArray(classrooms) ? classrooms.map((c: any) => {
    const startTime = getTimeString(c.class_start);
    const endTime = getTimeString(c.class_end);
    return {
      title: c.class_name,
      daysOfWeek: [c.day],
      startTime,
      endTime,
      extendedProps: { classroomId: c.id, roomNumber: c.room_number, className: c.class_name, term: c.term, prodi: c.prodi, startTime, endTime },
    };
  }) : [];

  return <WeeklyScheduleClient events={events} role={user.role.toLowerCase()} />;
}
