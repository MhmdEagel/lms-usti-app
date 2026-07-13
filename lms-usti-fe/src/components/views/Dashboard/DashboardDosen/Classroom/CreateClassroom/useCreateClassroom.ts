import { zodResolver } from "@hookform/resolvers/zod";
import { newClassroomSchema } from "@/schemas/schemas";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { classroomServices } from "@/services/classroom.service";
import { useRouter } from "next/navigation";
import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const useCreateClassroom = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [coverPreview, setCoverPreview] = useState("basic");

  const createClassForm = useForm({
    defaultValues: {
      class_cover: "basic",
    },
    resolver: zodResolver(newClassroomSchema),
  });

  const handleCloseForm = () => {
    setIsOpen(false);
    createClassForm.reset();
  };

  const handleCreateClassroom = async (data: z.infer<typeof newClassroomSchema>) => {
    try {
      setIsPending(true);
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
      const timeStartDateObj = dayjs.tz(`2010-10-10 ${class_start}`, "Asia/Jakarta");
      const timeEndDateObj = dayjs.tz(`2010-10-10 ${class_end}`, "Asia/Jakarta");
      await classroomServices.create({
        class_cover,
        class_name,
        term,
        day: parseInt(`${day}`),
        room_number,
        class_start: timeStartDateObj.toISOString(),
        class_end: timeEndDateObj.toISOString(),
        prodi,
        tahun_ajaran,
      });
      handleCloseForm();
      router.refresh();
    } catch (e) {
      createClassForm.setError("root", {
        message: (e as Error).message,
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    isOpen,
    isPending,
    setIsOpen,
    createClassForm,
    handleCreateClassroom,
    handleCloseForm,
    coverPreview,
    setCoverPreview
  };
};

export default useCreateClassroom;
