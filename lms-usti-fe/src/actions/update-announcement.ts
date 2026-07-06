"use server";

import { classroomServices } from "@/services/classroom.service";
import { revalidatePath } from "next/cache";

interface UpdateAnnouncementPayload {
  is_pinned?: boolean;
  title?: string;
  content?: string;
}

export const updateAnnouncement = async (
  classroomId: string,
  announcementId: string,
  payload: UpdateAnnouncementPayload,
) => {
  try {
    await classroomServices.updateAnnouncement(
      classroomId,
      announcementId,
      payload,
    );
    revalidatePath(".");
  } catch (e) {
    throw e;
  }
};
