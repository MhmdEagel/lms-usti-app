import Classroom from "@/components/views/Dashboard/DashboardDosen/Classroom/Classroom";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () => createMetadata({ title: "Kelas" });

export default async function ClassroomPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string |  undefined }>
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;
  const limit = sp.limit ? parseInt(sp.limit) : 10;
  return <Classroom searchParams={sp} page={page} limit={limit} />;
}
