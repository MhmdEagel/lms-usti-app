import Material from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/Material";
import MaterialSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/MaterialSkeleton";
import { Suspense } from "react";

export default async function ArchivedMateriPage({
  params,
  searchParams,
}: {
  params: Promise<{ classroomId: string }>;
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const { classroomId } = await params;
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;
  const limit = sp.limit ? parseInt(sp.limit) : 10;
  const search = sp.search || "";

  return (
    <>
      <Suspense fallback={<MaterialSkeleton />}>
        <Material classroomId={classroomId} page={page} limit={limit} search={search} />
      </Suspense>
    </>
  );
}
