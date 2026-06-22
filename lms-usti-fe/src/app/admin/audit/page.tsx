import AuditLogs from "@/components/views/Dashboard/DashboardAdmin/AuditLogs/AuditLogs";
import AuditLogsSkeleton from "@/components/views/Dashboard/DashboardAdmin/AuditLogs/AuditLogsSkeleton";
import { Suspense } from "react";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Audit Logs</h2>
        <p className="text-sm text-muted-foreground">
          Catatan aktivitas admin di LMS USTI
        </p>
      </div>
      <Suspense fallback={<AuditLogsSkeleton />}>
        <AuditLogs page={page} limit={limit} />
      </Suspense>
    </div>
  );
}
