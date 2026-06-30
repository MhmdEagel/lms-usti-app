"use server";

import { commentServices } from "@/services/comment.service";
import { revalidatePath } from "next/cache";

export async function createComment(
  classroomId: string,
  resourceId: string,
  payload: { content: string },
  revalidatePathname: string,
  type: "material" | "assignment" = "material",
) {
  try {
    if (type === "assignment") {
      await commentServices.createAssignmentComment(classroomId, resourceId, payload);
    } else {
      await commentServices.createComment(classroomId, resourceId, payload);
    }
    revalidatePath(revalidatePathname);
    return { success: "Komentar berhasil dibuat", error: null };
  } catch (e) {
    return { success: null, error: (e as Error).message };
  }
}
