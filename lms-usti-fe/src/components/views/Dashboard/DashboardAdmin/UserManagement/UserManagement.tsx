import { getAllUsers } from "@/actions/admin";
import UserTable from "./UserTable";

export default async function UserManagement({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}) {
  const result = await getAllUsers({ page, limit });
  const users: IUser[] = result.data || [];
  const pagination: PaginationInfo = result.pagination || {
    limit,
    total_pages: 1,
    total: users.length,
    current: page,
  };

  return <UserTable users={users} pagination={pagination} />;
}
