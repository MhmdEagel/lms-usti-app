
import Kelas from "@/components/views/Dashboard/DashboardMahasiswa/Kelas/Kelas";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Kelas" });

export default function KelasPage() {
  return <Kelas />;
}
