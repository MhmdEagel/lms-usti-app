"use server";

import { assignmentServices } from "@/services/assignment.service";
import type { IAssignmentWaitingGrade } from "@/types/Classroom";

export async function getWaitingGrade(): Promise<IAssignmentWaitingGrade[]> {
  try {
    const res = await assignmentServices.findWaitingGrade();
    return res.data?.data ?? [];
  } catch {
    return [];
  }
}
