"use server";
import { mediaServices } from "@/services/media.service";
export const deleteFileSubmission = async (fileName: string) => {
  try {
    const res = await mediaServices.deleteSubmission(fileName);
    return res.data;
  } catch (e) {
    throw e;
  }
};
