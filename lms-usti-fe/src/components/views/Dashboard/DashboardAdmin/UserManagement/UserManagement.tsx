import { getAllUsers } from "@/actions/admin";
import UserTable from "./UserTable";

export default async function UserManagement() {
  const result = await getAllUsers();
  const users: IUser[] = result.data || [];

  return <UserTable users={users} />;
}
