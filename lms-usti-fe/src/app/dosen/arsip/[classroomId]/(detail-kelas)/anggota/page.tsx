import ClassroomMembers from "@/components/common/ClassroomMembers/ClassroomMembers";
import MembersSkeleton from "@/components/common/ClassroomMembers/MembersSkeleton/MembersSkeleton";
import { Suspense } from "react";

export default async function ArchivedAnggotaPage({
  params,
}: {
  params: Promise<{ classroomId: string }>
}) {
  const {classroomId} = await params;
  return (
    <>
    <Suspense fallback={<MembersSkeleton />}>
      <ClassroomMembers classroomId={classroomId} />
    </Suspense>
    </>
  )
}
