import { classroomServices } from "@/services/classroom.service";
import Content from "./Content/Content";
export default async function ClassSettings({
  classroomId,
}: {
  classroomId: string;
}) {
  const res = await classroomServices.getDetail(classroomId);
  const classDetail = res.data?.data;

  return (
    <div className="flex min-h-[450px]">
      <Content classroomId={classroomId} classDetail={classDetail!} />
    </div>
  );
}
