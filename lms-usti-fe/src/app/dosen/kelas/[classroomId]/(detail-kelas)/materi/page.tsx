import Material from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/Material";
import MaterialSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/MaterialSkeleton";
import { Suspense } from "react";

export default async function MateriPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  return (
    <>
      <Suspense fallback={<MaterialSkeleton />}>
        <Material classroomId={classroomId} />
      </Suspense>
    </>
  );
}
