import DashboardMahasiswa from "@/components/views/Dashboard/DashboardMahasiswa/DashboardMahasiswa";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Mahasiswa" });

export default function DosenDashboardPage() {
  return <DashboardMahasiswa />;
}
