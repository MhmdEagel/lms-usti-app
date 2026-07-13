import { classroomServices } from "@/services/classroom.service";
import { useRouter } from "next/navigation";
import { joinClassroomSchema } from "@/schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const useJoinClassroom = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      classroom_code: "",
    },
    resolver: zodResolver(joinClassroomSchema),
  });

  const handleJoinClassroomForm = async (data: { classroom_code: string }) => {
    const { classroom_code } = data;
    try {
      setIsPending(true);
      await classroomServices.join({ class_code: classroom_code });
      toast.success("Berhasil gabung kelas");
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return {
    open,
    setOpen,
    isPending,
    form,
    handleJoinClassroomForm,
  };
};
