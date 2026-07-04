"use server";

import { forumServices } from "@/services/forum.service";
import { revalidatePath } from "next/cache";

export async function deleteForumComment(postId: string, commentId: string) {
  try {
    await forumServices.deleteComment(postId, commentId);
    revalidatePath("/prodi/forum");
    revalidatePath("/dosen/forum");
    revalidatePath(`/prodi/forum/${postId}`);
    revalidatePath(`/dosen/forum/${postId}`);
    return { success: "Komentar berhasil dihapus", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
