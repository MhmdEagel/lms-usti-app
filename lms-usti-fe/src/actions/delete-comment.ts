"use server";

import { commentServices } from "@/services/comment.service";
import { revalidatePath } from "next/cache";

export async function deleteComment(
  classroomId: string,
  materialId: string,
  commentId: string,
  revalidatePathname: string,
) {
  try {
    await commentServices.deleteComment(classroomId, materialId, commentId);
    revalidatePath(revalidatePathname);
    return { success: "Komentar berhasil dihapus", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
