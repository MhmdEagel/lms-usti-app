import { getCurrentUser } from "@/lib/auth";
import { classroomServices } from "@/services/classroom.service";
import { commentServices } from "@/services/comment.service";
import AnnouncementDetail from "@/components/common/AnnouncementDetail/AnnouncementDetail";
import type { IAnnouncement, IClassroomPolicies } from "@/types/Classroom";
import type { IComment } from "@/types/Classroom";

export default async function MahasiswaAnnouncementDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string; announcementId: string }>;
}) {
  const { classroomId, announcementId } = await params;
  const user = await getCurrentUser();

  const [announcementRes, commentsRes, policiesRes] = await Promise.all([
    classroomServices.getAnnouncementById(classroomId, announcementId),
    commentServices.getAnnouncementComments(classroomId, announcementId),
    classroomServices.getPolicies(classroomId),
  ]);

  const announcement: IAnnouncement | undefined = announcementRes.data?.data;
  const comments: IComment[] = commentsRes.data?.data ?? [];
  const policies: IClassroomPolicies | null = policiesRes.data?.data ?? null;

  if (!announcement) {
    return (
      <div className="text-center py-12 text-gray-400">
        Pengumuman tidak ditemukan.
      </div>
    );
  }

  return (
    <AnnouncementDetail
      classroomId={classroomId}
      announcement={announcement}
      comments={comments}
      currentId={user.id}
      currentRole={user.role}
      policies={policies}
    />
  );
}
