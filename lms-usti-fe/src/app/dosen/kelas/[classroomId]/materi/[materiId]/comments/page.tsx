import { Suspense } from "react";
import MaterialBreadcrumb from "@/components/common/MaterialDetail/MaterialBreadcrumb";
import MaterialTabNavigation from "@/components/common/MaterialDetail/MaterialTabNavigation";
import CommentSectionData from "@/components/common/MaterialDetail/Comment/CommentSectionData";
import CommentSectionSkeleton from "@/components/common/MaterialDetail/Comment/CommentSectionSkeleton";
import { getCurrentUser } from "@/lib/auth";
import { materialServices } from "@/services/material.service";
import type { IMaterial } from "@/types/Classroom";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CommentsPage({
  params,
}: {
  params: Promise<{ classroomId: string; materiId: string }>;
}) {
  const { classroomId, materiId } = await params;
  const user = await getCurrentUser();
  const res = await materialServices.findMaterialById(classroomId, materiId);
  const data: IMaterial = res.data?.data;

  return (
    <div className="p-4">
      <MaterialBreadcrumb
        classroomId={classroomId}
        materialId={materiId}
        classroomName={data?.classroom_detail?.classroom_name ?? ""}
        materialName={data?.title ?? ""}
        role={user.role}
      />
      <Link
        className="mb-2"
        href={`/${user.role.toLowerCase()}/kelas/${classroomId}/materi`}
      >
        <Button className="rounded-full" variant="ghost">
          <ArrowLeft /> Kembali
        </Button>
      </Link>
      <div className="p-4 w-full">
        <MaterialTabNavigation />
        <Suspense fallback={<CommentSectionSkeleton />}>
          <CommentSectionData
            classroomId={classroomId}
            materiId={materiId}
            currentId={user.id}
            currentRole={user.role}
          />
        </Suspense>
      </div>
    </div>
  );
}
