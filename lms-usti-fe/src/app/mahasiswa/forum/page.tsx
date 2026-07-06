import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import ForumPostList from "@/components/common/Forum/ForumPostList/ForumPostList";
import ForumPostListSkeleton from "@/components/common/Forum/ForumPostList/ForumPostListSkeleton";

export default async function MahasiswaForumPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-4 space-y-4">
      <Suspense fallback={<ForumPostListSkeleton />}>
        <ForumPostList currentId={user.id} currentRole={user.role} />
      </Suspense>
    </div>
  );
}
