"use server";

import { mediaServices } from "@/services/media.service";
import { IAttachment } from "@/types/Classroom";

export const deleteAssignmentBatch = async (files: IAttachment[]) => {
  try {
    const fileUrls = files.map((f) => f.url);
    const res = await mediaServices.deleteAssignmentBatch({ files: fileUrls });
    return res.data;
  } catch (e) {
    throw e;
  }
};
