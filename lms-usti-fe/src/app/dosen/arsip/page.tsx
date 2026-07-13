import ArchivedClassroomList from "@/components/common/ArchivedClassroomList/ArchivedClassroomList";
import { createMetadata } from "@/lib/metadata";

export const generateMetadata = () =>
  createMetadata({ title: "Kelas Yang Diarsipkan" });

export default async function ArchivedClassroomPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;
  const limit = sp.limit ? parseInt(sp.limit) : 10;
  return (
    <ArchivedClassroomList
      type="dosen"
      searchParams={sp}
      page={page}
      limit={limit}
    />
  );
}
