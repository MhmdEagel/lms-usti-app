"use client";

import WeeklyCalendar from "@/components/common/WeeklyCalendar/WeeklyCalendar";
import type { ScheduleEvent } from "@/actions/get-schedule";

interface PropTypes {
  events: ScheduleEvent[];
  role: string;
}

export default function WeeklyScheduleClient({ events, role }: PropTypes) {
  return <WeeklyCalendar events={events} role={role} />;
}
