import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import CreateForumPost from "@/components/common/Forum/CreateForumPost/CreateForumPost";
import ForumPostList from "@/components/common/Forum/ForumPostList/ForumPostList";
import ForumPostListSkeleton from "@/components/common/Forum/ForumPostList/ForumPostListSkeleton";

export default async function ProdiForumPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-4 space-y-4">
      <CreateForumPost />
      <Suspense fallback={<ForumPostListSkeleton />}>
        <ForumPostList currentId={user.id} currentRole={user.role} />
      </Suspense>
    </div>
  );
}
