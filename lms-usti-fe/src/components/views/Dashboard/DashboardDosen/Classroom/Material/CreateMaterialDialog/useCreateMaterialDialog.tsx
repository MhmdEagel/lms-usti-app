import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { IAttachment } from "@/types/Classroom";
import { createMaterialSchema } from "@/schemas/material";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";
import { z } from "zod";
import { newMaterialSchema } from "@/schemas/schemas";
import { materialServices } from "@/services/material.service";
import { mediaServices } from "@/services/media.service";
import { useRouter } from "next/navigation";

const useCreateMaterialDialog = () => {
  const [open, setOpen] = useState("closed");
  const [isVisible, setIsVisible] = useState(false);
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isPendingUploadFile, setIsPendingUploadFile] = useState(false);
  const router = useRouter();
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
    try {
      await materialServices.create(payload, classroomId);
      toast.success("Berhasil menambahkan materi");
      router.refresh();
      setAttachments([]);
      materialForm.reset();
      setOpen("closed");
    } catch (e) {
      const err = e as AxiosError<ErrorResponse>;
      toast.error(err.response?.data.meta.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = async () => {
    try {
      setIsPending(true);
      const filesToDelete = attachments.filter(
        (a) => a.type === "FILE",
      );
      if (filesToDelete.length > 0) {
        await mediaServices.deleteBatch({ files: filesToDelete.map(f => f.url) });
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
      const res = await mediaServices.uploadMaterial(formData);
      const newFile: IAttachment = {
        name: res.data?.data?.file_name,
        url: res.data?.data?.file_url,
        unique_name: res.data?.data?.unique_file_name,
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
