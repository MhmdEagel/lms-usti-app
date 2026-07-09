"use server";

import { classroomServices } from "@/services/classroom.service";
import { revalidatePath } from "next/cache";

export const deleteForumPost = async (classroomId: string, forumPostId: string) => {
  try {
    await classroomServices.deleteForumPost(classroomId, forumPostId);
    revalidatePath(".");
  } catch (e) {
    throw(e);
  }
};
