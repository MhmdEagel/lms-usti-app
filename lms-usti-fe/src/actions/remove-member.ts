"use server";

import { classroomServices } from "@/services/classroom.service";
import { revalidatePath } from "next/cache";

export const removeMember = async (classroomId: string, memberId: string) => {
  await classroomServices.removeMember(classroomId, memberId);
  revalidatePath(`/dosen/kelas/${classroomId}/anggota`);
};
