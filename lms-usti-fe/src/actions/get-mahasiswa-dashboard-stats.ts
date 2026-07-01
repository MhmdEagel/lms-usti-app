"use server";

import { classroomServices } from "@/services/classroom.service";
import type { IMahasiswaDashboardStats } from "@/types/Classroom";

export async function getMahasiswaDashboardStats(): Promise<IMahasiswaDashboardStats | null> {
  try {
    const res = await classroomServices.getMahasiswaDashboardStats();
    return res.data?.data ?? null;
  } catch {
    return null;
  }
}
