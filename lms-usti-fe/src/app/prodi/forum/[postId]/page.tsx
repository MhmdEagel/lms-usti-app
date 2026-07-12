import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { forumServices } from "@/services/forum.service";
import ForumPostDetail from "@/components/common/Forum/ForumPostDetail/ForumPostDetail";
import ForumPostDetailSkeleton from "@/components/common/Forum/ForumPostDetail/ForumPostDetailSkeleton";

async function ForumDetailSection({ postId, userId, role }: { postId: string; userId: string; role: string }) {
  const res = await forumServices.getPostById(postId);
  const post = res.data?.data as IForumPostDetail | undefined;

  if (!post) {
    return <div className="text-muted-foreground text-center py-12 text-sm">Postingan tidak ditemukan.</div>;
  }

  return <ForumPostDetail post={post} currentId={userId} currentRole={role} />;
}

export default async function ProdiForumPostDetailPage(props: { params: Promise<{ postId: string }> }) {
  const { postId } = await props.params;
  const user = await getCurrentUser();

  return (
    <div className="p-4">
      <Suspense fallback={<ForumPostDetailSkeleton />}>
        <ForumDetailSection postId={postId} userId={user.id} role={user.role} />
      </Suspense>
    </div>
  );
}
