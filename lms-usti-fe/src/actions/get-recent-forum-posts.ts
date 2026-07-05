"use server";

import dayjs from "dayjs";
import { forumServices } from "@/services/forum.service";

export async function getRecentForumPosts(): Promise<IForumPost[]> {
  try {
    const res = await forumServices.getPosts();
    const posts = res.data?.data as IForumPost[] | undefined;
    if (!posts) return [];

    const twentyFourHoursAgo = dayjs().subtract(24, "hour");
    return posts.filter((post) => dayjs(post.created_at).isAfter(twentyFourHoursAgo));
  } catch {
    return [];
  }
}
