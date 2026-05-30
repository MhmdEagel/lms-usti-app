"use server";

import { classroomServices } from "@/services/classroom.service";
import { revalidatePath } from "next/cache";

export const deleteAnnoucement = async (classroomId: string, annId: string) => {
  try {
    await classroomServices.deleteAnnouncement(classroomId, annId);
    revalidatePath(".");
  } catch (e) {
    throw(e);
  }
};
