import { classroomServices } from "@/services/classroom.service";
import Content from "./Content/Content";
export default async function ClassSettings({
  classroomId,
}: {
  classroomId: string;
}) {
  const [classroomRes, policiesRes] = await Promise.all([
    classroomServices.getDetail(classroomId),
    classroomServices.getPolicies(classroomId),
  ]);
  const classDetail = classroomRes.data?.data;
  const policies = policiesRes.data?.data ?? null;

  return (
    <div className="flex flex-col md:flex-row min-h-[450px]">
      <Content classroomId={classroomId} classDetail={classDetail!} policies={policies} />
    </div>
  );
}
