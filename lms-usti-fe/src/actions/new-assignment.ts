"use server";

import { assignmentServices } from "@/services/assignment.service";
import { IUpdateAssignment } from "@/types/Classroom";
import { revalidatePath } from "next/cache";

export const newAssignment = async (payload: IUpdateAssignment, classroomId: string) => {
  try {
    await assignmentServices.create(payload, classroomId);
    revalidatePath(`/dosen/kelas/${classroomId}/tugas`);
    return { success: "Berhasil menambahkan tugas", error: null };
  } catch (e) {
    console.error((e as Error).message);
    return { success: null, error: "Terladi Kesalahan" };
  }
};
