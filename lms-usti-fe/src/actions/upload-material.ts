"use server";

import { mediaServices } from "@/services/media.service";

export const uploadMaterial = async (payload: FormData) => {
  try {
    const res = await mediaServices.uploadMaterial(payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};
