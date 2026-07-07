"use server";

import { classroomServices } from "@/services/classroom.service";
import { revalidatePath } from "next/cache";

interface UpdateForumPostPayload {
  is_pinned?: boolean;
  title?: string;
  content?: string;
}

export const updateForumPost = async (
  classroomId: string,
  forumPostId: string,
  payload: UpdateForumPostPayload,
) => {
  try {
    await classroomServices.updateForumPost(
      classroomId,
      forumPostId,
      payload,
    );
    revalidatePath(".");
  } catch (e) {
    throw e;
  }
};
