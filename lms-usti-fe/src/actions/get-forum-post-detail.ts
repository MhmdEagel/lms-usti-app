"use server";

import { forumServices } from "@/services/forum.service";

export async function getForumPostDetail(postId: string) {
  try {
    const res = await forumServices.getPostById(postId);
    return { data: res.data.data as IForumPostDetail, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
