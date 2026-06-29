import { Suspense } from "react";
import AssignmentDetailGrading from "@/components/common/AssignmentDetail/AssignmentDetailGrading/AssignmentDetailGrading";
import AssignmentDetailGradingSkeleton from "@/components/common/AssignmentDetail/AssignmentDetailGrading/AssignmentDetailGradingSkeleton";

export default async function PenilaianPage({
  params,
  searchParams,
}: {
  params: Promise<{ classroomId: string; assignmentId: string }>;
  searchParams: Promise<{ page?: string; limit?: string; search?: string; filter?: string }>;
}) {
  const { classroomId, assignmentId } = await params;
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;
  const limit = sp.limit ? parseInt(sp.limit) : 10;
  const search = sp.search || "";
  const filter = sp.filter || "semua";
  return (
    <Suspense fallback={<AssignmentDetailGradingSkeleton />}>
      <AssignmentDetailGrading
        classroomId={classroomId}
        assignmentId={assignmentId}
        page={page}
        limit={limit}
        search={search}
        filter={filter}
      />
    </Suspense>
  );
}
