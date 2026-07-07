"use server";

import { commentServices } from "@/services/comment.service";
import { revalidatePath } from "next/cache";

export async function createAnnouncementComment(
  classroomId: string,
  announcementId: string,
  payload: { content: string },
) {
  try {
    await commentServices.createAnnouncementComment(classroomId, announcementId, payload);
    revalidatePath(`/dosen/kelas/${classroomId}/pengumuman/${announcementId}`);
    revalidatePath(`/mahasiswa/kelas/${classroomId}/pengumuman/${announcementId}`);
    return { success: "Komentar berhasil dibuat", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
