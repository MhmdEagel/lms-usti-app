import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import WeeklySchedule from "@/components/common/WeeklySchedule/WeeklySchedule";
import ScheduleSkeleton from "@/components/views/Dashboard/DashboardDosen/ScheduleSkeleton";
import MahasiswaAssignmentList from "./MahasiswaAssignmentList/MahasiswaAssignmentList";
import MahasiswaAssignmentListSkeleton from "./MahasiswaAssignmentList/MahasiswaAssignmentListSkeleton";
import MahasiswaDashboardStatsCards from "./MahasiswaDashboardStatsCards";
import MahasiswaDashboardStatsCardsSkeleton from "./MahasiswaDashboardStatsCardsSkeleton";
import MahasiswaRecentClassroomPosts from "./MahasiswaRecentClassroomPosts";
import MahasiswaRecentClassroomPostsSkeleton from "./MahasiswaRecentClassroomPostsSkeleton";
import MahasiswaRecentPublicPosts from "./MahasiswaRecentPublicPosts";
import MahasiswaRecentPublicPostsSkeleton from "./MahasiswaRecentPublicPostsSkeleton";

export default async function DashboardStudent() {
  return (
    <div className="p-4 space-y-8">
      <section>
        <Card>
          <CardContent>
            <Suspense fallback={<MahasiswaDashboardStatsCardsSkeleton />}>
              <MahasiswaDashboardStatsCards />
            </Suspense>
          </CardContent>
        </Card>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<MahasiswaAssignmentListSkeleton />}>
          <MahasiswaAssignmentList />
        </Suspense>
        <Suspense fallback={<MahasiswaRecentClassroomPostsSkeleton />}>
          <MahasiswaRecentClassroomPosts />
        </Suspense>
        <Suspense fallback={<MahasiswaRecentPublicPostsSkeleton />}>
          <MahasiswaRecentPublicPosts />
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
