"use server";

import { mediaServices } from "@/services/media.service";
import { IFileMaterial } from "@/types/Classroom";

export const deleteMaterialBatch = async (files: IFileMaterial[]) => {
  try {
    const res = await mediaServices.deleteBatch({ files });
    return res.data;
  } catch (e) {
    throw e;
  }
};
