import DashboardStudent from "@/components/views/Dashboard/DashboardStudent/DashboardStudent";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Mahasiswa" });

export default function DosenDashboardPage() {
  return <DashboardStudent />;
}
