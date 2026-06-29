import { assignmentServices } from "@/services/assignment.service";
import type { IAssignment, ISubmission } from "@/types/Classroom";
import AssignmentBreadcrumb from "../AssignmentBreadcrumb";
import GradingContent from "./GradingContent";
import AssignmentDetailTabNavbar from "../AssignmentDetailTabNavbar/AssignmentDetailTabNavbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  page: number;
  limit: number;
  search: string;
}

export default async function PenilaianData({
  classroomId,
  assignmentId,
  page,
  limit,
  search,
}: PropTypes) {
  const params = { page, limit, ...(search ? { search } : {}) };
  const [assignmentRes, submissionsRes] = await Promise.all([
    assignmentServices.findAssignmentById(classroomId, assignmentId),
    assignmentServices.findSubmissions(classroomId, assignmentId, params),
  ]);

  const assignment: IAssignment = assignmentRes.data?.data;
  const submissions: ISubmission[] = submissionsRes.data?.data || [];
  const pagination = submissionsRes.data?.pagination;

  if (!assignment) {
    return (
      <div className="p-4 flex flex-col justify-center items-center h-128">
        <div className="text-2xl md:text-4xl font-bold text-primary mb-1">
          404
        </div>
        <div className="text-base md:text-2xl">Tugas tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div>
      <AssignmentBreadcrumb
        classroomId={classroomId}
        assignmentId={assignmentId}
        classroomName={assignment.classroom_name}
        assignmentTitle={assignment.title}
        role="dosen"
      />
      <Link className="mb-2" href={`/dosen/kelas/${classroomId}/tugas`}>
        <Button className="rounded-full" variant="ghost">
          <ArrowLeft /> Kembali
        </Button>
      </Link>
      <AssignmentDetailTabNavbar
        classroomId={classroomId}
        assignmentId={assignmentId}
        type="dosen"
      />
      <GradingContent
        classroomId={classroomId}
        assignmentId={assignmentId}
        assignment={assignment}
        submissions={submissions}
        pagination={pagination}
      />
    </div>
  );
}
