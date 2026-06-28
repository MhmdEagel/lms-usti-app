import { Suspense } from "react";
import { assignmentServices } from "@/services/assignment.service";
import type { IAssignment, ISubmission } from "@/types/Classroom";
import AssignmentBreadcrumb from "../AssignmentBreadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AssignmentDetailTabNavbar from "../AssignmentDetailTabNavbar/AssignmentDetailTabNavbar";
import AssignmentDetailGradingSkeleton from "./AssignmentDetailGradingSkeleton";
import GradingContent from "./GradingContent";

interface PropTypes {
  classroomId: string;
  assignmentId: string;
}

export default async function AssignmentDetailGrading(props: PropTypes) {
  const { classroomId, assignmentId } = props;

  const [assignmentRes, submissionsRes] = await Promise.all([
    assignmentServices.findAssignmentById(classroomId, assignmentId),
    assignmentServices.findSubmissions(classroomId, assignmentId),
  ]);

  const assignment: IAssignment = assignmentRes.data?.data;
  console.log(assignment)
  const submissions: ISubmission[] = submissionsRes.data?.data || [];

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
    <div className="p-4">
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
      <Suspense fallback={<AssignmentDetailGradingSkeleton />}>
        <GradingContent
          classroomId={classroomId}
          assignmentId={assignmentId}
          assignment={assignment}
          submissions={submissions}
        />
      </Suspense>
    </div>
  );
}
