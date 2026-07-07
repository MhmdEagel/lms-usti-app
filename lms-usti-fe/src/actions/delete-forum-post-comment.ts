"use server";

import { commentServices } from "@/services/comment.service";
import { revalidatePath } from "next/cache";

export async function deleteAnnouncementComment(
  classroomId: string,
  announcementId: string,
  commentId: string,
) {
  try {
    await     commentServices.deleteForumPostComment(classroomId, announcementId, commentId);
    revalidatePath(`/dosen/kelas/${classroomId}/forum-kelas/${announcementId}`);
    revalidatePath(`/mahasiswa/kelas/${classroomId}/forum-kelas/${announcementId}`);
    return { success: "Komentar berhasil dihapus", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
