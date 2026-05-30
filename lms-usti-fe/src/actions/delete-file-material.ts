"use server";
import { mediaServices } from "@/services/media.service";
export const deleteFileMaterial = async (materialFileName: string) => {
  try {
    const res = await mediaServices.deleteMaterial(materialFileName);
    return res.data;
  } catch (e) {
    throw e;
  }
};
