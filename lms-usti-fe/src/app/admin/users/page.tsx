import UserManagement from "@/components/views/Dashboard/DashboardAdmin/UserManagement/UserManagement";
import UserTableSkeleton from "@/components/views/Dashboard/DashboardAdmin/UserManagement/UserTableSkeleton";
import { Suspense } from "react";

export default async function UsersPage({
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
        <h2 className="text-xl font-semibold">Manajemen User</h2>
        <p className="text-sm text-muted-foreground">
          Daftar seluruh pengguna LMS USTI
        </p>
      </div>
      <Suspense fallback={<UserTableSkeleton />}>
        <UserManagement page={page} limit={limit} />
      </Suspense>
    </div>
  );
}
