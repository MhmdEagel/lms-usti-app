"use server";
import { mediaServices } from "@/services/media.service";
export const deleteFileAssignment = async (materialFileName: string) => {
  try {
    const res = await mediaServices.deleteAssignment(materialFileName);
    return res.data;
  } catch (e) {
    throw e;
  }
};