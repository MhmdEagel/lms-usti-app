import { getForumPosts } from "@/actions/get-forum-posts";
import ForumPostItem from "../ForumPostItem/ForumPostItem";

interface PropTypes {
  currentUserId: string;
  currentRole: string;
}

export default async function ForumPostList({ currentUserId, currentRole }: PropTypes) {
  const { data: posts } = await getForumPosts();

  if (!posts || posts.length === 0) {
    return (
      <div className="text-gray-400 text-center py-12">
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
          currentUserId={currentUserId}
          currentRole={currentRole}
        />
      ))}
    </div>
  );
}
