import ProdiDashboard from "@/components/views/Dashboard/DashboardProdi/ProdiDashboard";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Beranda" });

export default function ProdiDashboardPage() {
  return <ProdiDashboard />;
}
