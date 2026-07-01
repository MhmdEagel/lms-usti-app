import { Suspense } from "react";
import WeeklySchedule from "@/components/common/WeeklySchedule/WeeklySchedule";
import ScheduleSkeleton from "@/components/views/Dashboard/DashboardDosen/ScheduleSkeleton";
import MahasiswaAssignmentList from "./MahasiswaAssignmentList/MahasiswaAssignmentList";
import MahasiswaAssignmentListSkeleton from "./MahasiswaAssignmentList/MahasiswaAssignmentListSkeleton";

export default async function DashboardStudent() {
  return (
    <div className="p-4">
      <section className="mt-4">
        <Suspense fallback={<MahasiswaAssignmentListSkeleton />}>
          <MahasiswaAssignmentList />
        </Suspense>
      </section>
      <section className="mt-8">
        <Suspense fallback={<ScheduleSkeleton />}>
          <WeeklySchedule />
        </Suspense>
      </section>
    </div>
  );
}
