import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { classroomServices } from "@/services/classroom.service";
import { commentServices } from "@/services/comment.service";
import ClassroomDetailForumSection from "@/components/common/ClassroomDetailForum/ClassroomDetailForumSection";
import type { IClassroomDetailForum, IComment } from "@/types/Classroom";

async function AnnouncementDetailPageContent({
  classroomId,
  announcementId,
  userId,
  role,
}: {
  classroomId: string;
  announcementId: string;
  userId: string;
  role: string;
}) {
  const [announcementRes, commentsRes] = await Promise.all([
    classroomServices.getForumPostById(classroomId, announcementId),
    commentServices.getForumPostComments(classroomId, announcementId),
  ]);

  const announcement = announcementRes.data?.data as IClassroomDetailForum | undefined;
  const comments = commentsRes.data?.data as IComment[] | undefined;

  if (!announcement) {
    return (
      <div className="text-center py-12 text-gray-400">
        Pengumuman tidak ditemukan.
      </div>
    );
  }

  return (
    <ClassroomDetailForumSection
      announcement={announcement}
      initialComments={comments ?? []}
      classroomId={classroomId}
      currentUserId={userId}
      currentRole={role}
    />
  );
}

export default async function MahasiswaAnnouncementDetailPage(props: {
  params: Promise<{ classroomId: string; announcementId: string }>;
}) {
  const { classroomId, announcementId } = await props.params;
  const user = await getCurrentUser();

  return (
    <Suspense fallback={<div className="text-center py-12">Memuat...</div>}>
      <AnnouncementDetailPageContent
        classroomId={classroomId}
        announcementId={announcementId}
        userId={user.id}
        role={user.role}
      />
    </Suspense>
  );
}
