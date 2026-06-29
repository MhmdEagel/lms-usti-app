import { editClassroomSchema } from "@/schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { editDetailClassroom } from "@/actions/edit-detail-classroom";
import { toast } from "sonner";
import { useState } from "react";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";
import { z } from "zod";

export const useDetail = () => {
  const [coverPreview, setCoverPreview] = useState("");
  const [isPending, setIsPending] = useState(false)
  const editForm = useForm({
    resolver: zodResolver(editClassroomSchema),
  });
  const { setValue: setDetailValue } = editForm;
  const handleEdit = async (classroomId: string, payload: z.infer<typeof editClassroomSchema>) => {
    try {
      setIsPending(true)
      const res = await editDetailClassroom({ classroomId, payload });
      toast.success(res.meta.message);
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
