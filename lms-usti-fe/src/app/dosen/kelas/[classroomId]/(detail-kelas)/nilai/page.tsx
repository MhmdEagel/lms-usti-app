import ClassroomGrades from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomGrades/ClassroomGrades";
import ClassroomGradesSkeleton from "@/components/views/Dashboard/DashboardDosen/Classroom/ClassroomGrades/ClassroomGradesSkeleton";
import { classroomServices } from "@/services/classroom.service";
import type { ClassroomGradesResponse } from "@/types/Classroom";
import { Suspense } from "react";

async function ClassroomGradesContent({ classroomId }: { classroomId: string }) {
  const [gradesRes, classroomRes] = await Promise.all([
    classroomServices.getGrades(classroomId),
    classroomServices.getDetail(classroomId),
  ]);
  const data: ClassroomGradesResponse = gradesRes.data?.data;
  const classroomName: string = classroomRes.data?.data?.class_name;

  return <ClassroomGrades data={data} classroomName={classroomName} />;
}

export default async function PenilaianPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;

  return (
    <Suspense fallback={<ClassroomGradesSkeleton />}>
      <ClassroomGradesContent classroomId={classroomId} />
    </Suspense>
  );
}
