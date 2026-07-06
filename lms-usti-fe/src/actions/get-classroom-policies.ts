"use server";

import { classroomServices } from "@/services/classroom.service";
import type { IClassroomPolicies } from "@/types/Classroom";

export async function getClassroomPolicies(classroomId: string) {
  try {
    const res = await classroomServices.getPolicies(classroomId);
    return { data: res.data?.data as IClassroomPolicies, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
