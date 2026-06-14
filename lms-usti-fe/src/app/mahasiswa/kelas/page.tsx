import Classroom from "@/components/views/Dashboard/DashboardStudent/Classroom/Classroom";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Kelas" });

export default function KelasPage() {
  return <Classroom />;
}
