"use server";

import { assignmentServices } from "@/services/assignment.service";
import { revalidatePath } from "next/cache";

export const submitAssignment = async (
  classroomId: string,
  assignmentId: string,
  attachments: { name: string; type: string; url: string; unique_name?: string }[],
) => {
  try {
    await assignmentServices.createSubmission(
      classroomId,
      assignmentId,
      { attachments },
    );
    revalidatePath(
      `/mahasiswa/kelas/${classroomId}/tugas/${assignmentId}`,
    );
    return { success: "Tugas berhasil dikumpulkan", error: null };
  } catch (e) {
    console.error((e as Error).message);
    return { success: null, error: "Gagal mengumpulkan tugas" };
  }
};
