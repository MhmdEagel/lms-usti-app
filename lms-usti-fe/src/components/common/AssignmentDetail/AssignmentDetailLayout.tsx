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
  type?: "dosen" | "mahasiswa";
}) {
  const classroomDetail = await classroomServices.getDetail(classroomId);
  const user = await getCurrentUser();
  const res = await assignmentServices.findAssignmentById(
    classroomId,
    assignmentId,
  );
  const data: IAssignment = res.data?.data;
  const classroomData: IClassroom = classroomDetail.data?.data;

  dayjs.locale("id");
  const role = user.role as "DOSEN" | "MAHASISWA";

  if (!data) {
    return (
      <div className="p-4 flex flex-col justify-center items-center h-128">
        <Image
          width={300}
          height={300}
          src={"/images/ilustration/404.svg"}
          alt="Not Found Image"
        />
        <div className="text-2xl md:text-4xl font-bold text-primary mb-1">
          404
          <div className="text-base md:text-2xl">Tugas tidak ditemukan</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <AssignmentBreadcrumb
        classroomId={classroomData.id!}
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
