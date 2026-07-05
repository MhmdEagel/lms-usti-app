"use server";

import { forumServices } from "@/services/forum.service";
import { revalidatePath } from "next/cache";

export async function deleteForumPost(postId: string) {
  try {
    await forumServices.deletePost(postId);
    revalidatePath("/prodi/forum");
    revalidatePath("/dosen/forum");
    revalidatePath(`/prodi/forum/${postId}`);
    revalidatePath(`/dosen/forum/${postId}`);
    return { success: "Postingan berhasil dihapus", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
