"use server";

import { classroomServices } from "@/services/classroom.service";
import type { IDashboardStats } from "@/types/Classroom";

export async function getDashboardStats(): Promise<IDashboardStats | null> {
  try {
    const res = await classroomServices.getDashboardStats();
    return res.data?.data ?? null;
  } catch {
    return null;
  }
}
