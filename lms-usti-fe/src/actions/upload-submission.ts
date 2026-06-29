"use server";

import { mediaServices } from "@/services/media.service";

export const uploadSubmission = async (payload: FormData) => {
  try {
    const res = await mediaServices.uploadSubmission(payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};
