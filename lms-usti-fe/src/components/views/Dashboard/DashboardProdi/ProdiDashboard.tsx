import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import ProdiDashboardStatsCards from "./ProdiDashboardStatsCards";
import ProdiDashboardStatsSkeleton from "./ProdiDashboardStatsSkeleton";
import ProdiRecentForumPosts from "./ProdiRecentForumPosts";
import ProdiQuickActions from "./ProdiQuickActions";

export default async function ProdiDashboard() {
  return (
    <div className="p-4 gap-8 flex flex-col">
      <section>
        <Card>
          <CardContent>
            <Suspense fallback={<ProdiDashboardStatsSkeleton />}>
              <ProdiDashboardStatsCards />
            </Suspense>
          </CardContent>
        </Card>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="min-h-[300px] rounded-xl border p-4 flex flex-col"><div className="animate-pulse bg-muted flex-1 rounded" /></div>}>
          <ProdiRecentForumPosts />
        </Suspense>
        <ProdiQuickActions />
      </section>
    </div>
  );
}
