"use server";

import { getCurrentUser } from "@/lib/auth";
import { classroomServices } from "@/services/classroom.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const joinClassroom = async (classCode: string) => {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "MAHASISWA")
    throw new Error("Hanya mahasiswa yang dapat gabung kelas");

  try {
    await classroomServices.join({ code: classCode });
    revalidatePath("/mahasiswa/kelas");
    return { success: "Berhasil gabung kelas", error: null };
  } catch (e) {
    console.log((e as Error).message);
    return { success: null, error: (e as Error).message };
  }
};
