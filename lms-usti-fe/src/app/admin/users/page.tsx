import UserManagement from "@/components/views/Dashboard/DashboardAdmin/UserManagement/UserManagement";
import UserTableSkeleton from "@/components/views/Dashboard/DashboardAdmin/UserManagement/UserTableSkeleton";
import { Suspense } from "react";

export default function UsersPage() {
  return (
    <div className="p-6 space-y-4">
      <Suspense fallback={<UserTableSkeleton />}>
        <UserManagement />
      </Suspense>
    </div>
  );
}
