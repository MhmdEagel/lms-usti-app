"use client";

import WeeklyCalendar from "@/components/common/WeeklyCalendar/WeeklyCalendar";
interface ScheduleEvent {
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

interface PropTypes {
  events: ScheduleEvent[];
  role: string;
}

export default function WeeklyScheduleClient({ events, role }: PropTypes) {
  return <WeeklyCalendar events={events} role={role} />;
}
