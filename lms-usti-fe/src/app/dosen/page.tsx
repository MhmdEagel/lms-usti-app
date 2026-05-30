import DashboardDosen from "@/components/views/Dashboard/DashboardDosen/DashboardDosen";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Dosen" });

export default async function DosenDashboardPage() {
  
  return <DashboardDosen />;
}
