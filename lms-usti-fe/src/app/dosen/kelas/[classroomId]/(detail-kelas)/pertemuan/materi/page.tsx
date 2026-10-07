import { Suspense } from "react";
import CreateMaterialDialog from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/CreateMaterialDialog/CreateMaterialDialog";
import MeetingTabNavigation from "@/components/views/Dashboard/DashboardDosen/Classroom/Meeting/MeetingTabNavigation";
import Material from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/Material";
import MaterialSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/MaterialSkeleton";

export default async function PertemuanMateriPage({
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
      <MeetingTabNavigation classroomId={classroomId} type="dosen" />
      <div className="flex items-center justify-between mb-4 border-b-1 pb-4">
        <div>
          <h2 className="text-lg font-semibold">List Materi</h2>
        </div>
        <CreateMaterialDialog classroomId={classroomId} />
      </div>
      <Suspense fallback={<MaterialSkeleton />}>
        <Material classroomId={classroomId} page={page} limit={limit} search={search} showHeader={false} />
      </Suspense>
    </div>
  );
}
