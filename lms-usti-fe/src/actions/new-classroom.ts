"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { classroomServices } from "@/services/classroom.service";
import { newClassroomSchema } from "@/schemas/schemas";
import { z } from "zod";

dayjs.extend(utc);
dayjs.extend(timezone);

export const createNewClassroom = async (data: z.infer<typeof newClassroomSchema>) => {
  const user = await getCurrentUser();

  if (!user) redirect("/auth/login");
  if (user.role !== "DOSEN") throw new Error("Unauthorized");

  const {
    class_cover,
    class_name,
    day,
    room_number,
    class_start,
    class_end,
    term,
    prodi,
    tahun_ajaran,
  } = data;
  const timeStartDateObj = dayjs.tz(`10-10-2010 ${class_start}`, "Asia/Jakarta");
  const timeEndDateObj = dayjs.tz(`10-10-2010 ${class_end}`, "Asia/Jakarta");
  const newClassroom = {
    class_cover,
    class_name,
    term,
    day: parseInt(`${day}`),
    room_number,
    class_start: timeStartDateObj.toISOString(),
    class_end: timeEndDateObj.toISOString(),
    prodi,
    tahun_ajaran,
  };
  try {
    await classroomServices.create(newClassroom);
    revalidatePath("/dosen/kelas");
    return { success: "Kelas berhasil dibuat" };
  } catch (e) {
    console.log(e);
    throw new Error((e as Error).message);
  }
};
