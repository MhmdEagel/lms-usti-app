import Assignment from "@/components/views/Dashboard/DashboardDosen/Classroom/Assignment";
import AssignmentSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/Assignment/AssignmentSkeleton/AssignmentSkeleton";
import { Suspense } from "react";

export default async function TugasPage({
  params,
  searchParams,
}: {
  params: Promise<{ classroomId: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const { classroomId } = await params;
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;
  const limit = sp.limit ? parseInt(sp.limit) : 10;

  return (
    <Suspense fallback={<AssignmentSkeleton />}>
      <Assignment classroomId={classroomId} type="mahasiswa" page={page} limit={limit} />
    </Suspense>
  );
}
