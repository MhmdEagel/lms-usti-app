"use server";

import { commentServices } from "@/services/comment.service";
import { revalidatePath } from "next/cache";

export async function deleteForumPostComment(
  classroomId: string,
  forumPostId: string,
  commentId: string,
) {
  try {
    await     commentServices.deleteForumPostComment(classroomId, forumPostId, commentId);
    revalidatePath(`/dosen/kelas/${classroomId}/forum-kelas/${forumPostId}`);
    revalidatePath(`/mahasiswa/kelas/${classroomId}/forum-kelas/${forumPostId}`);
    return { success: "Komentar berhasil dihapus", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
