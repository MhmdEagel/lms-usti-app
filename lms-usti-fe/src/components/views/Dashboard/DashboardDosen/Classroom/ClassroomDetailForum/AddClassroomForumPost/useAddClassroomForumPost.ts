import { classroomServices } from "@/services/classroom.service";
import { newForumPostSchema } from "@/schemas/schemas";
import { ICreateClassroomForumPost } from "@/types/Classroom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const useAddForumPost = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(newForumPostSchema),
  });

  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  const handleAddForumPost = async (
    data: ICreateClassroomForumPost,
    classroomId: string,
  ) => {
    setIsPending(true);
    try {
      await classroomServices.createForumPost(data, classroomId);
      toast.success("Berhasil menambahkan pengumuman");
      router.refresh();
      form.reset();
      handleOpen(false);
    } catch {
      toast.error("Gagal membuat pengumuman");
    } finally {
      setIsPending(false);
    }
  };

  return {
    form,
    handleAddForumPost,
    open,
    handleOpen,
    handleClose,
    isPending,
  };
};

export default useAddForumPost;
