import { joinClassroom } from "@/actions/join-classroom";
import { joinClassroomSchema } from "@/schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const useGabungKelas = () => {
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
      const res = await joinClassroom(classroom_code);
      if (res?.success && !res.error) {
        toast.success(res.success);
        setOpen(false);
      }
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
