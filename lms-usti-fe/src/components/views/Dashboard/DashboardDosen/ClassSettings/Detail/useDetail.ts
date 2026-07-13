import { editClassroomSchema } from "@/schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { classroomServices } from "@/services/classroom.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";
import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const useDetail = () => {
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState("");
  const [isPending, setIsPending] = useState(false)
  const editForm = useForm({
    resolver: zodResolver(editClassroomSchema),
  });
  const { setValue: setDetailValue } = editForm;
  const handleEdit = async (classroomId: string, payload: z.infer<typeof editClassroomSchema>) => {
    try {
      setIsPending(true)
      const {
        class_cover,
        class_name,
        day,
        class_start,
        class_end,
        room_number,
        term,
      } = payload;
      const classStartDateObj = dayjs.tz(`2010-10-10 ${class_start}`, "Asia/Jakarta");
      const classEndDateObj = dayjs(`2010-10-10 ${class_end}`).tz("Asia/Jakarta");
      const res = await classroomServices.update({
        class_cover,
        class_name,
        day: day ? parseInt(day) : undefined,
        class_start: classStartDateObj.toISOString(),
        class_end: classEndDateObj.toISOString(),
        room_number: room_number ? parseInt(room_number) : undefined,
        term: term ? parseInt(term) : undefined,
      }, classroomId);
      toast.success(res.data.meta.message);
      router.refresh();
    } catch (e) {
      const err = e as AxiosError<ErrorResponse>;
      toast.error(err.response?.data.meta.message);
    } finally {
      setIsPending(false)
    }
  };
  return {
    editForm,
    handleEdit,
    coverPreview,
    setCoverPreview,
    setDetailValue,
    isPending
  };
};
