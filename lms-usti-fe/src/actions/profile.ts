"use server";

import profileServices from "@/services/profile.service";
import { APIResponse } from "@/types/Response";
import { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import type { IUpdateProfileRequest } from "@/types/Auth";

export async function updateProfile(data: IUpdateProfileRequest) {
  try {
    const res = await profileServices.updateProfile(data);
    revalidatePath("/admin/pengaturan");
    revalidatePath("/dosen/pengaturan");
    revalidatePath("/mahasiswa/pengaturan");
    revalidatePath("/prodi/pengaturan");
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}
