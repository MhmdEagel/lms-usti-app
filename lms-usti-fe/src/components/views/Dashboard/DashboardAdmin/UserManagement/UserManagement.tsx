import adminServices from "@/services/admin.service";
import UserTable from "./UserTable";

export default async function UserManagement({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}) {
  let users: IUser[] = [];
  let pagination: PaginationInfo = {
    limit,
    total_pages: 1,
    total: 0,
    current: page,
  };
  let error: string | null = null;

  try {
    const res = await adminServices.getAllUsers({ page, limit });
    const result = res.data;
    users = result.data || [];
    pagination = result.pagination || {
      limit,
      total_pages: 1,
      total: users.length,
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

  return <UserTable users={users} pagination={pagination} />;
}
