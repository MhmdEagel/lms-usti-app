import { Suspense } from "react";
import AssignmentBreadcrumb from "@/components/common/AssignmentDetail/AssignmentBreadcrumb";
import AssignmentTabNavigation from "@/components/common/AssignmentDetail/AssignmentTabNavigation";
import CommentSectionData from "@/components/common/AssignmentDetail/Comment/CommentSectionData";
import CommentSectionSkeleton from "@/components/common/MaterialDetail/Comment/CommentSectionSkeleton";
import { getCurrentUser } from "@/lib/auth";
import { assignmentServices } from "@/services/assignment.service";
import type { IAssignment } from "@/types/Classroom";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CommentsPage({
  params,
}: {
  params: Promise<{ classroomId: string; assignmentId: string }>;
}) {
  const { classroomId, assignmentId } = await params;
  const user = await getCurrentUser();
  const res = await assignmentServices.findAssignmentById(classroomId, assignmentId);
  const data: IAssignment = res.data?.data;

  return (
    <div className="p-4">
      <AssignmentBreadcrumb
        classroomId={classroomId}
        assignmentId={assignmentId}
        classroomName={data?.classroom_name ?? ""}
        assignmentTitle={data?.title ?? ""}
        role={user.role.toLowerCase()}
      />
      <Link
        className="mb-2"
        href={`/${user.role.toLowerCase()}/kelas/${classroomId}/tugas`}
      >
        <Button className="rounded-full" variant="ghost">
          <ArrowLeft /> Kembali
        </Button>
      </Link>
      <div className="p-4 w-full">
        <AssignmentTabNavigation />
        <Suspense fallback={<CommentSectionSkeleton />}>
          <CommentSectionData
            classroomId={classroomId}
            assignmentId={assignmentId}
            currentId={user.id}
            currentRole={user.role}
          />
        </Suspense>
      </div>
    </div>
  );
}
