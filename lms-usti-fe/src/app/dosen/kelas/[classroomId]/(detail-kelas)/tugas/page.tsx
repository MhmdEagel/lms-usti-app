import Assignment from "@/components/views/Dashboard/DashboardDosen/Classroom/Assignment";
import { Suspense } from "react";

export default async function TugasPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Assignment classroomId={classroomId} />
      </Suspense>
    </>
  );
}
