"use server";

import { assignmentServices } from "@/services/assignment.service";
import { IUpdateAssignment } from "@/types/Classroom";
import { revalidatePath } from "next/cache";

export const editAssignment = async (
  data: IUpdateAssignment,
  classroomId: string,
  assignmentId: string,
) => {
  try {
    const res = await assignmentServices.update(data, classroomId, assignmentId);
    revalidatePath(`dosen/kelas/${classroomId}/tugas/${assignmentId}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};
