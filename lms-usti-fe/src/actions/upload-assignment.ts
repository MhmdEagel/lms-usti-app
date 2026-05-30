"use server";

import { mediaServices } from "@/services/media.service";

export const uploadAssignment = async (payload: FormData) => {
  try {
    const res = await mediaServices.uploadAssignment(payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};
