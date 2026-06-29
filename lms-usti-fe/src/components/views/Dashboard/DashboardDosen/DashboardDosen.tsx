import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Suspense } from "react";

import DashboardStatsCards from "./ClassroomCount";
import WaitingGradeList from "./WaitingGradeList";
import WeeklySchedule from "@/components/common/WeeklySchedule/WeeklySchedule";

export default async function DashboardDosen() {
  return (
    <div className="p-4"> 
      <section>
        <Card>
          <CardContent>
            <Suspense fallback={<p>Loading stats...</p>}>
              <DashboardStatsCards />
            </Suspense>
          </CardContent>
        </Card>
      </section>
      <section className="mt-8">
        <Suspense fallback={<p>Loading...</p>}>
          <WaitingGradeList />
        </Suspense>
      </section>
      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Jadwal Perkuliahan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p>Loading...</p>}>
              <WeeklySchedule />
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
