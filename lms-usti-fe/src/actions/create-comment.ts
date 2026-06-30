"use server";

import { commentServices } from "@/services/comment.service";
import { revalidatePath } from "next/cache";

export async function createComment(
  classroomId: string,
  materialId: string,
  payload: { content: string },
  revalidatePathname: string,
) {
  try {
    await commentServices.createComment(classroomId, materialId, payload);
    revalidatePath(revalidatePathname);
    return { success: "Komentar berhasil dibuat", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
