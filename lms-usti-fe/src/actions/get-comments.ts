"use server";

import { commentServices } from "@/services/comment.service";
import type { IComment } from "@/types/Classroom";

export async function getComments(
  classroomId: string,
  materialId: string,
): Promise<{ data: IComment[] | null; error: string | null }> {
  try {
    const res = await commentServices.getComments(classroomId, materialId);
    return { data: res.data?.data ?? [], error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
