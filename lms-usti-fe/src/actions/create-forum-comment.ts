"use server";

import { forumServices } from "@/services/forum.service";
import { revalidatePath } from "next/cache";

export async function createForumComment(postId: string, payload: { content: string }) {
  try {
    await forumServices.createComment(postId, payload);
    revalidatePath("/prodi/forum");
    revalidatePath("/dosen/forum");
    return { success: "Komentar berhasil dibuat", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
