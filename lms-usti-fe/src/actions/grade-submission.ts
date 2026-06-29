"use server";

import { assignmentServices } from "@/services/assignment.service";
import { revalidatePath } from "next/cache";

export const gradeSubmission = async (
  classroomId: string,
  assignmentId: string,
  submissionId: string,
  payload: { score: number | null; feedback: string | null },
) => {
  try {
    const res = await assignmentServices.gradeSubmission(
      classroomId,
      assignmentId,
      submissionId,
      payload,
    );
    revalidatePath(`/dosen/kelas/${classroomId}/tugas/${assignmentId}/penilaian`)
    return { data: res.data, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
};
