import { classroomServices } from "@/services/classroom.service";
import { IClassroomMemberDetail } from "@/types/Classroom";
import MemberProfile from "@/components/common/MemberProfile";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ classroomId: string; memberId: string }>;
}) {
  const { classroomId, memberId } = await params;
  const res = await classroomServices.getMemberDetail(classroomId, memberId);
  const data: IClassroomMemberDetail = res.data.data;

  const { member, class_name } = data;

  return (
    <MemberProfile
      id={member.id}
      fullname={member.fullname}
      profile={member.profile}
      email={member.email}
      nim={member.nim}
      role={member.role}
      classroomId={classroomId}
      className={class_name}
      viewerRole="MAHASISWA"
    />
  );
}
