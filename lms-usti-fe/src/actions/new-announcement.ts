"use server";

import { classroomServices } from "@/services/classroom.service";
import { ICreateClassroomDetailForum } from "@/types/Classroom";
import { revalidatePath } from "next/cache";

export const createNewAnnouncement = async (
  payload: ICreateClassroomDetailForum,
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
