import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";
import { getCurrentUser } from "@/lib/auth";
import { assignmentServices } from "@/services/assignment.service";
import { classroomServices } from "@/services/classroom.service";
import type { IAssignment, IClassroom } from "@/types/Classroom";
import AssignmentBreadcrumb from "./AssignmentBreadcrumb";
import AssignmentDetailTabNavbar from "./AssignmentDetailTabNavbar/AssignmentDetailTabNavbar";
import BackButton from "@/components/common/BackButton/BackButton";

dayjs.extend(utc);
dayjs.extend(timezone);

export default async function AssignmentDetailLayout({
  children,
  classroomId,
  assignmentId,
  type = "dosen",
}: {
  children: React.ReactNode;
  classroomId: string;
  assignmentId: string;
  type?: string;
}) {
  const user = await getCurrentUser();
  const role = user.role.toLowerCase();

  const [classroomRes, assignmentRes] = await Promise.all([
    classroomServices.getDetail(classroomId).catch(() => null),
    assignmentServices.findAssignmentById(classroomId, assignmentId).catch(() => null),
  ]);
  const classroomData = classroomRes?.data?.data as IClassroom | undefined;
  const data = assignmentRes?.data?.data as IAssignment | undefined;
  const tabType = role === "mahasiswa" ? "mahasiswa" : "dosen";

  return (
    <div className="p-4">
      <AssignmentBreadcrumb
        classroomId={classroomId}
        assignmentId={assignmentId}
        classroomName={classroomData?.class_name || "Kelas"}
        assignmentTitle={data?.title || "Tugas"}
        role={role}
      />
      <div className="mb-2">
        <BackButton />
      </div>
      <AssignmentDetailTabNavbar
        classroomId={classroomId}
        assignmentId={assignmentId}
        type={tabType}
      />
      {children}
    </div>
  );
}
