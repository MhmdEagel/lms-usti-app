"use server";

import { mediaServices } from "@/services/media.service";
import { APIResponse } from "@/types/Response";
import { AxiosError } from "axios";

export const uploadProfilePicture = async (payload: FormData) => {
  try {
    const res = await mediaServices.uploadProfilePicture(payload);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const err = error as AxiosError<APIResponse>;
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
};
