import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { classroomServices } from "@/services/classroom.service";
import { commentServices } from "@/services/comment.service";
import ClassroomDetailForumSection from "@/components/common/ClassroomDetailForum/ClassroomDetailForumSection";
import ForumPostDetailSkeleton from "@/components/common/Forum/ForumPostDetail/ForumPostDetailSkeleton";
import type { IClassroomForumPost, IComment } from "@/types/Classroom";

async function AnnouncementDetailPageContent({
  classroomId,
  forumPostId,
  userId,
  role,
  forumPermission,
}: {
  classroomId: string;
  forumPostId: string;
  userId: string;
  role: string;
  forumPermission: string;
}) {
  const [announcementRes, commentsRes] = await Promise.all([
    classroomServices.getForumPostById(classroomId, forumPostId),
    commentServices.getForumPostComments(classroomId, forumPostId),
  ]);

  const announcement = announcementRes.data?.data as IClassroomForumPost | undefined;
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
      forumPermission={forumPermission}
    />
  );
}

export default async function MahasiswaAnnouncementDetailPage(props: {
  params: Promise<{ classroomId: string; forumId: string }>;
}) {
  const { classroomId, forumId: forumPostId } = await props.params;
  const user = await getCurrentUser();
  const policiesRes = await classroomServices.getPolicies(classroomId);
  const forumPermission: string = policiesRes.data?.data?.forum_permission ?? "comment_only";

  return (
    <Suspense fallback={<ForumPostDetailSkeleton />}>
      <AnnouncementDetailPageContent
        classroomId={classroomId}
        forumPostId={forumPostId}
        userId={user.id}
        role={user.role}
        forumPermission={forumPermission}
      />
    </Suspense>
  );
}
