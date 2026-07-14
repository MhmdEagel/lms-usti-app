import StudentGrades from "@/components/views/Dashboard/DashboardStudent/StudentGrades/StudentGrades";
import StudentGradesSkeleton from "@/components/views/Dashboard/DashboardStudent/StudentGrades/StudentGradesSkeleton";
import { classroomServices } from "@/services/classroom.service";
import type { StudentGradesResponse } from "@/types/Classroom";
import { Suspense } from "react";

async function StudentGradesContent({ classroomId }: { classroomId: string }) {
  const res = await classroomServices.getMyGrades(classroomId);
  const data: StudentGradesResponse = res.data?.data;

  return <StudentGrades data={data} classroomId={classroomId} />;
}

export default async function MahasiswaPenilaianPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;

  return (
    <Suspense fallback={<StudentGradesSkeleton />}>
      <StudentGradesContent classroomId={classroomId} />
    </Suspense>
  );
}
