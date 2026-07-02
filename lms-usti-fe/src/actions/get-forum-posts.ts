"use server";

import { forumServices } from "@/services/forum.service";

export async function getForumPosts() {
  try {
    const res = await forumServices.getPosts();
    return { data: res.data.data as IForumPost[], error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
