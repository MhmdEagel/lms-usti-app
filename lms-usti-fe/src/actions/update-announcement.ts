"use server";

import { classroomServices } from "@/services/classroom.service";
import { revalidatePath } from "next/cache";

export const updateAnnouncement = async (
  classroomId: string,
  announcementId: string,
  isPinned: boolean,
) => {
  try {
    await classroomServices.updateAnnouncement(classroomId, announcementId, {
      is_pinned: isPinned,
    });
    revalidatePath(".");
  } catch (e) {
    throw e;
  }
};
