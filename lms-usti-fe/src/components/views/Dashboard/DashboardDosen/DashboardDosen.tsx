import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";

import DashboardStatsCards from "./ClassroomCount";
import DashboardStatsSkeleton from "./DashboardStatsSkeleton";
import WaitingGradeList from "./WaitingGradeList";
import WaitingGradeListSkeleton from "./WaitingGradeListSkeleton";
import RecentForumPosts from "./RecentForumPosts";
import RecentForumPostsSkeleton from "./RecentForumPostsSkeleton";
import ScheduleSkeleton from "./ScheduleSkeleton";
import WeeklySchedule from "@/components/common/WeeklySchedule/WeeklySchedule";

export default async function DashboardDosen() {
  return (
    <div className="p-4">
      <section>
        <Card>
          <CardContent>
            <Suspense fallback={<DashboardStatsSkeleton />}>
              <DashboardStatsCards />
            </Suspense>
          </CardContent>
        </Card>
      </section>
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<WaitingGradeListSkeleton />}>
          <WaitingGradeList />
        </Suspense>
        <Suspense fallback={<RecentForumPostsSkeleton />}>
          <RecentForumPosts />
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
