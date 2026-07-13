import { classroomServices } from "@/services/classroom.service";
import { getCurrentUser } from "@/lib/auth";
import SettingsHeader from "./SettingsHeader/SettingsHeader";
import Detail from "./Detail/Detail";
import AssignmentForum from "./AssignmentForum/AssignmentForum";
import DangerZone from "./DangerZone/DangerZone";
import { Card, CardContent } from "@/components/ui/card";

export default async function ClassSettings({
  classroomId,
}: {
  classroomId: string;
}) {
  const [classroomRes, policiesRes, user] = await Promise.all([
    classroomServices.getDetail(classroomId),
    classroomServices.getPolicies(classroomId),
    getCurrentUser(),
  ]);
  const classDetail = classroomRes.data?.data;
  const policies = policiesRes.data?.data ?? null;

  return (
    <div className="space-y-10">
      <Card>
        <CardContent className="pt-6">
          <SettingsHeader
            title="Detail"
            description="Pengaturan umum dari kelas"
          />
          <Detail classroomId={classroomId} classDetail={classDetail!} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <SettingsHeader
            title="Tugas dan Forum"
            description="Pengaturan tugas dan forum kelas"
          />
          <AssignmentForum classroomId={classroomId} policies={policies} />
        </CardContent>
      </Card>

      {user.role === "DOSEN" && (
        <DangerZone
          classroomId={classroomId}
          classroomName={classDetail!.class_name}
          isArchived={classDetail!.is_archived}
        />
      )}
    </div>
  );
}
