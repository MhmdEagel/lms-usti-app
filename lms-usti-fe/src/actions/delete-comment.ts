"use server";

import { commentServices } from "@/services/comment.service";
import { revalidatePath } from "next/cache";

export async function deleteComment(
  classroomId: string,
  resourceId: string,
  commentId: string,
  revalidatePathname: string,
  type: "material" | "assignment" = "material",
) {
  try {
    if (type === "assignment") {
      await commentServices.deleteAssignmentComment(classroomId, resourceId, commentId);
    } else {
      await commentServices.deleteComment(classroomId, resourceId, commentId);
    }
    revalidatePath(revalidatePathname);
    return { success: "Komentar berhasil dihapus", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
