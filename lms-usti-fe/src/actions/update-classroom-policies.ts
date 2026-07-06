"use server";

import { classroomServices } from "@/services/classroom.service";
import { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import type { IClassroomPolicies } from "@/types/Classroom";
import type { APIResponse } from "@/types/Response";

export async function updateClassroomPolicies(classroomId: string, payload: IClassroomPolicies) {
  try {
    const res = await classroomServices.updatePolicies(classroomId, payload);
    revalidatePath(`/dosen/kelas/${classroomId}/pengaturan`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data?.meta?.message);
    }
    throw new Error("Terjadi kesalahan");
  }
}
