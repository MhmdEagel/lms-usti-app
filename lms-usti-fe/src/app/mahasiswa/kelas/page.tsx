import Classroom from "@/components/views/Dashboard/DashboardStudent/Classroom/Classroom";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Kelas" });

export default async function KelasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const search = await searchParams;
  return <Classroom searchParams={search} />;
}
