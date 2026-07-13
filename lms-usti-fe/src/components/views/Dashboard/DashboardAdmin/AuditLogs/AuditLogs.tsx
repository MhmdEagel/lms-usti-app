import adminServices from "@/services/admin.service";
import AuditLogsTable from "./AuditLogsTable";

export default async function AuditLogs({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}) {
  let logs: IAuditLog[] = [];
  let pagination: PaginationInfo = {
    limit,
    total_pages: 1,
    total: 0,
    current: page,
  };
  let error: string | null = null;

  try {
    const res = await adminServices.getAuditLogs({ page, limit });
    const result = res.data;
    logs = result.data || [];
    pagination = result.pagination || {
      limit,
      total_pages: 1,
      total: logs.length,
      current: page,
    };
  } catch {
    error = "Gagal mengambil data dari server";
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return <AuditLogsTable logs={logs} pagination={pagination} />;
}
