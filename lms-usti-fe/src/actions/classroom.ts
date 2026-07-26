"use server";

import { classroomServices } from "@/services/classroom.service";
import { extractErrorMessage } from "@/lib/error";
import { revalidatePath } from "next/cache";
import type { ICreateClassroom } from "@/types/Classroom";

export async function createClassroom(payload: ICreateClassroom) {
  try {
    await classroomServices.create(payload);
    revalidatePath("/prodi/penjadwalan");
    return { success: true as const, message: "Kelas berhasil dijadwalkan" };
  } catch (error) {
    return { success: false as const, error: extractErrorMessage(error) };
  }
}
