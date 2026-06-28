"use server";
import { assignmentServices } from "@/services/assignment.service";
import { revalidatePath } from "next/cache";
export const deleteAssignment = async (
  classroomId: string,
  assignmentId: string,
) => {
  try {
    const res = await assignmentServices.delete(classroomId, assignmentId);
    revalidatePath(`/dosen/kelas/${classroomId}/tugas`)
    return res.data;
  } catch (e) {
    throw e;
  }
};
