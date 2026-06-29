"use server";

import { assignmentServices } from "@/services/assignment.service";
import type { ISubmissionDetail } from "@/types/Classroom";

export const findSubmissionById = async (
  classroomId: string,
  assignmentId: string,
  submissionId: string,
) => {
  try {
    const res = await assignmentServices.findSubmissionDetail(
      classroomId,
      assignmentId,
      submissionId,
    );
    return { data: res.data?.data as ISubmissionDetail | null, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
};
