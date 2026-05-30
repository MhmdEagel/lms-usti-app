"use server";

import { materialServices } from "@/services/material.service";
import { IUpdateMaterial } from "@/types/Classroom";
import { revalidatePath } from "next/cache";

export const editMaterial = async (
  data: IUpdateMaterial,
  classroomId: string,
  materialId: string,
) => {
  try {
    const res = await materialServices.update(data, classroomId, materialId);
    revalidatePath(`dosen/kelas/${classroomId}/materi/${materialId}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};
