import { Suspense } from "react";
import PertemuanTabNavigation from "@/components/views/Dashboard/DashboardDosen/Classroom/Meeting/PertemuanTabNavigation";
import Material from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/Material";
import MaterialSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/MaterialSkeleton/MaterialSkeleton";

export default async function MahasiswaPertemuanMateriPage({
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
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Pertemuan</h2>
        <div className="border-b mt-1" />
      </div>
      <PertemuanTabNavigation classroomId={classroomId} type="mahasiswa" />
      <Suspense fallback={<MaterialSkeleton />}>
        <Material classroomId={classroomId} page={page} limit={limit} search={search} showHeader={false} />
      </Suspense>
    </div>
  );
}
