import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { IAttachment } from "@/types/Classroom";
import { createMaterialSchema } from "@/schemas/material";
import { uploadMaterial } from "@/actions/upload-material";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";
import { z } from "zod";
import { newMaterialSchema } from "@/schemas/schemas";
import { newMaterial } from "@/actions/new-material";
import { deleteMaterialBatch } from "@/actions/delete-material-batch";

const useCreateMaterialDialog = () => {
  const [open, setOpen] = useState("closed");
  const [isVisible, setIsVisible] = useState(false);
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isPendingUploadFile, setIsPendingUploadFile] = useState(false);
  const materialForm = useForm({
    defaultValues: {
      attachments: [],
    },
    resolver: zodResolver(createMaterialSchema),
  });

  const handleMaterialForm = async (
    data: z.infer<typeof newMaterialSchema>,
    classroomId: string,
  ) => {
    setIsPending(true);
    const payload = {
      ...data,
      attachments,
    };
    const res = await newMaterial(payload, classroomId);
    if (!res.success && res.error) {
      toast.error(res.error);
      setIsPending(false);
      return;
    }
    setIsPending(false);
    toast.success(res.success);
    setAttachments([]);
    materialForm.reset();
    setOpen("closed");
  };

  const handleClose = async () => {
    try {
      setIsPending(true);
      const filesToDelete = attachments.filter(
        (a) => a.type === "FILE",
      );
      if (filesToDelete.length > 0) {
        await deleteMaterialBatch(filesToDelete);
      }
    } catch (e) {
      const err = e as AxiosError<ErrorResponse>;
      toast.error(err.response?.data.meta.message);
    }
    setAttachments([]);
    setIsPending(false);
    materialForm.reset();
    setOpen("closed");
  };

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    formData.append("file", blob, file.name);
    try {
      setIsPendingUploadFile(true);
      const res = await uploadMaterial(formData);
      const newFile: IAttachment = {
        name: res.data?.file_name,
        url: res.data?.file_url,
        unique_name: res.data?.unique_file_name,
        type: "FILE",
      };
      setAttachments((prev) => [...prev, newFile]);
      toast.success("File berhasil diupload");
    } catch (e) {
      const err = e as AxiosError<ErrorResponse>;
      toast.error("File gagal diupload");
    } finally {
      setIsPendingUploadFile(false);
    }
  };

  return {
    open,
    setOpen,
    attachments,
    setAttachments,
    isPending,
    setIsPending,
    handleMaterialForm,
    materialForm,
    handleUploadFile,
    isPendingUploadFile,
    setIsPendingUploadFile,
    handleClose,
    isVisible,
  };
};

export default useCreateMaterialDialog;
