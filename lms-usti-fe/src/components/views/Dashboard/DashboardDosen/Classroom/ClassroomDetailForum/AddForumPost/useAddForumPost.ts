import { createNewAnnouncement } from "@/actions/new-announcement";
import { newForumPostSchema } from "@/schemas/schemas";
import { ICreateClassroomDetailForum } from "@/types/Classroom";
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

  const handleAddAnnouncement = async (
    data: ICreateClassroomDetailForum,
    classroomId: string,
  ) => {
    try {
      await createNewAnnouncement(data, classroomId);
      toast.success("Berhasil menambahkan pengumuman");
      handleOpen(false);
    } catch {
      toast.error("Gagal membuat pengumuman");
    }
  };

  return {
    form,
    handleAddAnnouncement,
    open,
    handleOpen,
  };
};

export default useAddForumPost;
