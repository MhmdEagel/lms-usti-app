import { getForumPosts } from "@/actions/get-forum-posts";
import ForumPostItem from "../ForumPostItem/ForumPostItem";

interface PropTypes {
  currentId: string;
  currentRole: string;
}

export default async function ForumPostList({ currentId, currentRole }: PropTypes) {
  const { data: posts } = await getForumPosts();

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
