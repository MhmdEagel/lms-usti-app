"use server";

import { classroomServices } from "@/services/classroom.service";
import { ICreateAnnouncement } from "@/types/Classroom";
import { revalidatePath } from "next/cache";

export const createNewAnnouncement = async (
  payload: ICreateAnnouncement,
  classroomId: string,
) => {
  try {
    await classroomServices.createAnnouncement(payload, classroomId);
    revalidatePath(".");
    return { success: "Pengumuman berhasil dibuat", error: null };
  } catch (e) {
    throw e;
  }
};
