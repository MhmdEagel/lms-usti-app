"use server";

import { forumServices } from "@/services/forum.service";
import { revalidatePath } from "next/cache";

export const deletePublicForumPost = async (postId: string) => {
  try {
    await forumServices.deletePost(postId);
    revalidatePath("/");
    return { success: "Postingan berhasil dihapus", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
};
