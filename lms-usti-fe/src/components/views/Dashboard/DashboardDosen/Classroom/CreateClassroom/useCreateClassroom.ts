import { zodResolver } from "@hookform/resolvers/zod";
import { newClassroomSchema } from "@/schemas/schemas";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { classroomServices } from "@/services/classroom.service";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toISOTime } from "@/lib/utils";
import { toast } from "sonner";

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
      await classroomServices.create({
        class_cover,
        class_name,
        term: Number(term),
        day: parseInt(`${day}`),
        room_number: Number(room_number),
        class_start: toISOTime(class_start),
        class_end: toISOTime(class_end),
        prodi,
        tahun_ajaran,
      });
      handleCloseForm();
      toast.success("Kelas berhasil dibuat");
      router.refresh();
    } catch (e) {
      const err = e as { response?: { data?: { meta?: { message?: string } } } };
      const message =
        err?.response?.data?.meta?.message ??
        (e as Error).message ??
        "Gagal membuat kelas";
      toast.error(message);
      createClassForm.setError("class_start", { message });
      createClassForm.setError("class_end", { message });
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
