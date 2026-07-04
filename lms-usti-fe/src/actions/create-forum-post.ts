"use server";

import { forumServices } from "@/services/forum.service";
import { revalidatePath } from "next/cache";

export async function createForumPost(payload: { title: string; content: string }) {
  try {
    await forumServices.createPost(payload);
    revalidatePath("/prodi/forum");
    revalidatePath("/dosen/forum");
    return { success: "Postingan berhasil dibuat", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
