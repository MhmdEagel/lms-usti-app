import { forumServices } from "@/services/forum.service";
import ForumPostItem from "../ForumPostItem/ForumPostItem";

interface PropTypes {
  currentId: string;
  currentRole: string;
}

export default async function ForumPostList({ currentId, currentRole }: PropTypes) {
  const res = await forumServices.getPosts(); const posts = res.data?.data as IForumPost[] | undefined;

  if (!posts || posts.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-12 text-sm">
        Belum ada postingan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <ForumPostItem
          key={post.id}
          post={post}
          currentId={currentId}
          currentRole={currentRole}
        />
      ))}
    </div>
  );
}
