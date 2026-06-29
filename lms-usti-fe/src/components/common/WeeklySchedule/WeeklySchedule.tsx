import { getSchedule } from "@/actions/get-schedule";
import { getCurrentUser } from "@/lib/auth";
import WeeklyScheduleClient from "./WeeklyScheduleClient";

export default async function WeeklySchedule() {
  const user = await getCurrentUser();
  if (!user) return null;

  const events = await getSchedule();

  return <WeeklyScheduleClient events={events} role={user.role.toLowerCase()} />;
}
