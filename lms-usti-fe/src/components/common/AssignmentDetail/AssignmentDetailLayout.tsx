import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";
import { getCurrentUser } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { assignmentServices } from "@/services/assignment.service";
import { classroomServices } from "@/services/classroom.service";
import type { IAssignment, IClassroom } from "@/types/Classroom";
import AssignmentBreadcrumb from "./AssignmentBreadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AssignmentDetailTabNavbar from "./AssignmentDetailTabNavbar/AssignmentDetailTabNavbar";

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
}) {

  return (
    <div className="p-4">
      <AssignmentBreadcrumb
        classroomId={classroomId}
        assignmentId={assignmentId}
        classroomName={classroomData.class_name}
        assignmentTitle={data.title}
        role={role}
      />
      <Link
        className="mb-2"
        href={`/${role.toLowerCase()}/kelas/${classroomId}/tugas`}
      >
        <Button className="rounded-full" variant="ghost">
          <ArrowLeft /> Kembali
        </Button>
      </Link>
      <AssignmentDetailTabNavbar
        classroomId={classroomId}
        assignmentId={assignmentId}
        type={type}
      />
      {children}
    </div>
  );
}
