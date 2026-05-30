"use server";
import { materialServices } from "@/services/material.service";
import { revalidatePath } from "next/cache";
export const deleteMaterial = async (
  classroomId: string,
  materialId: string,
) => {
  try {
    const res = await materialServices.delete(classroomId, materialId);
    revalidatePath(`/dosen/kelas/${classroomId}/materi`)
    return res.data;
  } catch (e) {
    throw e;
  }
};
