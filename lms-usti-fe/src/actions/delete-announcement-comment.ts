"use server";

import { commentServices } from "@/services/comment.service";
import { revalidatePath } from "next/cache";

export async function deleteAnnouncementComment(
  classroomId: string,
  announcementId: string,
  commentId: string,
) {
  try {
    await commentServices.deleteAnnouncementComment(classroomId, announcementId, commentId);
    revalidatePath(`/dosen/kelas/${classroomId}/pengumuman/${announcementId}`);
    revalidatePath(`/mahasiswa/kelas/${classroomId}/pengumuman/${announcementId}`);
    return { success: "Komentar berhasil dihapus", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
