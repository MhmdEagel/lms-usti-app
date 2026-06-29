"use server";

import { classroomServices } from "@/services/classroom.service";
import { getCurrentUser } from "@/lib/auth";
import { getTimeString } from "@/lib/utils";

export interface ScheduleEvent {
  title: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  extendedProps: {
    classroomId: string;
    roomNumber: number;
    className: string;
    term: number;
    prodi: string;
    startTime: string;
    endTime: string;
  };
}

export async function getSchedule(): Promise<ScheduleEvent[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  let res;
  if (user.role === "DOSEN") {
    res = await classroomServices.findAllDosenClassrooms({ limit: 9999 });
  } else {
    res = await classroomServices.findAllMahasiswaClassrooms({ limit: 9999 });
  }

  const classrooms = res.data?.data ?? [];
  if (!Array.isArray(classrooms)) return [];

  return classrooms.map((c: any) => {
    const startTime = getTimeString(c.class_start);
    const endTime = getTimeString(c.class_end);
    return {
      title: c.class_name,
      daysOfWeek: [c.day],
      startTime,
      endTime,
      extendedProps: {
        classroomId: c.id,
        roomNumber: c.room_number,
        className: c.class_name,
        term: c.term,
        prodi: c.prodi,
        startTime,
        endTime,
      },
    };
  });
}
