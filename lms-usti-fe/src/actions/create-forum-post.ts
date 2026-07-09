"use server";

import { classroomServices } from "@/services/classroom.service";
import { ICreateClassroomForumPost } from "@/types/Classroom";
import { revalidatePath } from "next/cache";

export const createNewForumPost = async (
  payload: ICreateClassroomForumPost,
  classroomId: string,
) => {
  try {
    await classroomServices.createForumPost(payload, classroomId);
    revalidatePath(".");
    return { success: "Pengumuman berhasil dibuat", error: null };
  } catch (e) {
    throw e;
  }
};
