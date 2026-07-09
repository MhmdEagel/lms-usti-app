import { createNewForumPost } from "@/actions/create-forum-post";
import { newForumPostSchema } from "@/schemas/schemas";
import { ICreateClassroomForumPost } from "@/types/Classroom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const useAddForumPost = () => {
  const form = useForm({
    resolver: zodResolver(newForumPostSchema),
  });

  const [open, setOpen] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const handleAddForumPost = async (
    data: ICreateClassroomForumPost,
    classroomId: string,
  ) => {
    try {
      await createNewForumPost(data, classroomId);
      toast.success("Berhasil menambahkan pengumuman");
      handleOpen(false);
    } catch {
      toast.error("Gagal membuat pengumuman");
    }
  };

  return {
    form,
    handleAddForumPost,
    open,
    handleOpen,
  };
};

export default useAddForumPost;
