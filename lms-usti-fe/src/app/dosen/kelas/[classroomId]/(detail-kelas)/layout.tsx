import ClassroomDetailLayout from "@/components/layouts/ClassroomDetailLayout/ClassroomDetailLayout";
import { classroomServices } from "@/services/classroom.service";

export default async function ClassroomDetailMainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  const res = await classroomServices.getDetail(classroomId);
  const classroomData = res.data?.data;
  return (
    <ClassroomDetailLayout
      type="dosen"
      classroomId={classroomId}
      classroom={classroomData!}
    >
      {children}
    </ClassroomDetailLayout>
  );
}
