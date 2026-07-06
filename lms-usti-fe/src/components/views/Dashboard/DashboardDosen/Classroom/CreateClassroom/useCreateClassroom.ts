import { zodResolver } from "@hookform/resolvers/zod";
import { newClassroomSchema } from "@/schemas/schemas";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { createNewClassroom } from "@/actions/new-classroom";
import { z } from "zod";

const useCreateClassroom = () => {
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
      const res = await createNewClassroom(data);
      if (res.success) handleCloseForm();
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
