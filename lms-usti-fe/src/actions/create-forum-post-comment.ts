"use server";

import { commentServices } from "@/services/comment.service";
import { revalidatePath } from "next/cache";

export async function createForumPostComment(
  classroomId: string,
  forumPostId: string,
  payload: { content: string },
) {
  try {
    await     commentServices.createForumPostComment(classroomId, forumPostId, payload);
    revalidatePath(`/dosen/kelas/${classroomId}/forum-kelas/${forumPostId}`);
    revalidatePath(`/mahasiswa/kelas/${classroomId}/forum-kelas/${forumPostId}`);
    return { success: "Komentar berhasil dibuat", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
