import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
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
  const [arrayOfFiles, setArrayOfFiles] = useState<IAttachment[]>([]);
  const [arrayOfLinks, setArrayOfLinks] = useState<IAttachment[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isPendingUploadFile, setIsPendingUploadFile] = useState(false);
  const materialForm = useForm({
    defaultValues: {
      attachments: [],
    },
    resolver: zodResolver(createMaterialSchema),
  });

  useEffect(() => {
    materialForm.setValue("attachments", arrayOfFiles);
  }, [arrayOfFiles]);

  const pdfMateriRef = useRef<HTMLInputElement>(null);
  const handleMaterialForm = async (
    data: z.infer<typeof newMaterialSchema>,
    classroomId: string,
  ) => {
    setIsPending(true);
    const payload = {
      ...data,
      attachments: [...arrayOfFiles, ...arrayOfLinks],
    };
    const res = await newMaterial(payload, classroomId);
    if (!res.success && res.error) {
      toast.error(res.error);
      setIsPending(false);
      return;
    }
    setIsPending(false);
    toast.success(res.success);
    setArrayOfFiles([]);
    setArrayOfLinks([]);
    setOpen("closed");
  };

  const handleClose = async () => {
    try {
      setIsPending(true);
      if (arrayOfFiles.length > 0) {
        await deleteMaterialBatch(arrayOfFiles);
      }
    } catch (e) {
      const err = e as AxiosError<ErrorResponse>;
      toast.error(err.response?.data.meta.message);
    }
    setArrayOfFiles([]);
    setArrayOfLinks([]);
    setIsPending(false);
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
      setArrayOfFiles((prevValue) => [...prevValue, newFile]);
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
    arrayOfFiles,
    setArrayOfFiles,
    arrayOfLinks,
    setArrayOfLinks,
    isPending,
    setIsPending,
    pdfMateriRef,
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
