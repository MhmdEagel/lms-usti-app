import { Suspense } from "react";
import WeeklySchedule from "@/components/common/WeeklySchedule/WeeklySchedule";
import ScheduleSkeleton from "@/components/views/Dashboard/DashboardDosen/ScheduleSkeleton";
import MahasiswaAssignmentList from "./MahasiswaAssignmentList/MahasiswaAssignmentList";
import MahasiswaAssignmentListSkeleton from "./MahasiswaAssignmentList/MahasiswaAssignmentListSkeleton";

export default async function DashboardStudent() {
  return (
    <div className="p-4 space-y-8">
      <section>
        <Suspense fallback={<MahasiswaAssignmentListSkeleton />}>
          <MahasiswaAssignmentList />
        </Suspense>
      </section>
      <section>
        <Suspense fallback={<ScheduleSkeleton />}>
          <WeeklySchedule />
        </Suspense>
      </section>
    </div>
  );
}
