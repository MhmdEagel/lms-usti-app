import { Suspense } from "react";
import MeetingTabNavigation from "@/components/views/Dashboard/DashboardDosen/Classroom/Meeting/MeetingTabNavigation";
import Assignment from "@/components/views/Dashboard/DashboardDosen/Classroom/Assignment";
import AssignmentSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/Assignment/AssignmentSkeleton/AssignmentSkeleton";

export default async function MahasiswaPertemuanTugasPage({
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
      <MeetingTabNavigation classroomId={classroomId} type="mahasiswa" />
      <Suspense fallback={<AssignmentSkeleton />}>
        <Assignment classroomId={classroomId} type="mahasiswa" page={page} limit={limit} search={search} showHeader={false} />
      </Suspense>
    </div>
  );
}
