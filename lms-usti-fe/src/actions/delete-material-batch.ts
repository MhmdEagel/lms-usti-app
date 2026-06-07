"use server";

import { mediaServices } from "@/services/media.service";
import { IAttachment } from "@/types/Classroom";

export const deleteMaterialBatch = async (files: IAttachment[]) => {
  try {
    const res = await mediaServices.deleteBatch({ files });
    return res.data;
  } catch (e) {
    throw e;
  }
};
