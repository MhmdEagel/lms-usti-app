"use server";

import { materialServices } from "@/services/material.service";
import { INewMaterial } from "@/types/Classroom";
import { revalidatePath } from "next/cache";

export const newMaterial = async (payload: INewMaterial, classroomId: string) => {
  try {
    await materialServices.create(payload, classroomId);
    revalidatePath(`/dosen/kelas/${classroomId}/materi`)
    return { success: "Berhasil menambahkan materi", error: null };
  } catch (e) {
    console.error((e as Error).message);
    return { success: null, error: "Terjadi Kesalahan" };
  }
};
