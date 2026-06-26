"use server";

import { editClassroomSchema } from "@/schemas/schemas";
import { classroomServices } from "@/services/classroom.service";
import { IUpdateClassroom } from "@/types/Classroom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { revalidatePath } from "next/cache";
import { z } from "zod";

dayjs.extend(utc);
dayjs.extend(timezone);

export const editDetailClassroom = async ({
  classroomId,
  payload,
}: {
  classroomId: string;
  payload: z.infer<typeof editClassroomSchema>;
}) => {
  const {
    class_cover,
    class_name,
    day,
    class_start,
    class_end,
    room_number,
    term,
  } = payload;

  const classStartDateObj = dayjs.tz(`2010-10-10 ${class_start  }`, "Asia/Jakarta");
  const classEndDateObj = dayjs(`2010-10-10 ${class_end}`).tz("Asia/Jakarta");

  

  const updatedClassroom: IUpdateClassroom = {
    class_cover,
    class_name,
    day: day ? parseInt(day) : null,
    class_start: classStartDateObj.toISOString(),
    class_end: classEndDateObj.toISOString(),
    room_number: room_number ? parseInt(room_number) : null,
    term: term ? parseInt(term) : null,
  };
  try {
    const res = await classroomServices.update(updatedClassroom, classroomId);
    revalidatePath(".");
    return res.data;
  } catch (e) {
    throw e;
  }
};
