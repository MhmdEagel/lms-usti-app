interface IForumPost {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_profile: string;
  created_by: string;
  is_pinned: boolean;
  comment_count: number;
  created_at: string;
}

interface IForumPostDetail {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_profile: string;
  created_by: string;
  is_pinned: boolean;
  created_at: string;
  comments: IComment[];
}
