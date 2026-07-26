import WeeklySchedule from "@/components/common/WeeklySchedule/WeeklySchedule";
import CreateClassroom from "@/components/views/Dashboard/DashboardProdi/CreateClassroom/CreateClassroom";

export default function ProdiPenjadwalanPage() {
  return (
    <div className="flex flex-col gap-4 p-4 min-h-dvh min-w-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Penjadwalan</h1>
        <CreateClassroom />
      </div>
      <WeeklySchedule />
    </div>
  );
}
