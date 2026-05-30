import DashboardLayout from "@/components/layouts/DashboardLayout/DashboardLayout";
import { getCurrentUser } from "@/lib/auth";

export default async function MahasiswaDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return <DashboardLayout user={user} type="mahasiswa">{children}</DashboardLayout>;
}
