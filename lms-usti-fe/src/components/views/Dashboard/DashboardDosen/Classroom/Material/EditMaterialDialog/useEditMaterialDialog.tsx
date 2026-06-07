import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { IAttachment } from "@/types/Classroom";
import { createMaterialSchema } from "@/schemas/material";
import { uploadMaterial } from "@/actions/upload-material";
import { z } from "zod";
import { newMaterialSchema } from "@/schemas/schemas";
import { deleteMaterialBatch } from "@/actions/delete-material-batch";
import { editMaterial } from "@/actions/edit-material";
import { deleteFileMaterial } from "@/actions/delete-file-material";

type TrackStatus = "original" | "new" | "deleted";

export interface TrackedAttachment extends IAttachment {
  status: TrackStatus;
}

const useEditMaterialDialog = () => {
  const [trackedAttachments, setTrackedAttachments] = useState<TrackedAttachment[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isPendingUploadFile, setIsPendingUploadFile] = useState(false);
  const materialForm = useForm({
    defaultValues: {
      attachments: [],
    },
    resolver: zodResolver(createMaterialSchema),
  });

  const initializeAttachments = (attachments: IAttachment[]) => {
    const tracked: TrackedAttachment[] = attachments.map((att) => ({
      ...att,
      status: "original" as TrackStatus,
    }));
    setTrackedAttachments(tracked);
  };

  useEffect(() => {
    const nonDeleted = trackedAttachments.filter((f) => f.status !== "deleted");
    materialForm.setValue("attachments", nonDeleted as IAttachment[]);
  }, [trackedAttachments]);

  const pdfMateriRef = useRef<HTMLInputElement>(null);

  const handleMaterialForm = async (
    data: z.infer<typeof newMaterialSchema>,
    classroomId: string,
    materialId: string,
    setOpen: Dispatch<SetStateAction<string>>,
  ) => {
    try {
      setIsPending(true);
      const payload = {
        ...data,
        attachments: trackedAttachments.filter((f) => f.status !== "deleted"),
      };
      await editMaterial(payload, classroomId, materialId);
      const deletedFiles = trackedAttachments.filter(
        (f) => f.status === "deleted" && f.unique_name,
      );
      if (deletedFiles.length > 0) {
        await deleteMaterialBatch(deletedFiles);
      }
      toast.success("Berhasil mengubah materi");
      handleClose(setOpen);
    } catch (e) {
      toast.error("Gagal mengubah materi");
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = async (setOpen: Dispatch<SetStateAction<string>>) => {
    const newFiles = trackedAttachments.filter(
      (f) => f.status === "new" && f.type !== "LINK",
    );
    if (newFiles.length > 0) {
      try {
        for (const file of newFiles) {
          await deleteFileMaterial(file.unique_name);
        }
      } catch {
        console.error("Failed to delete new files");
      }
    }
    setTrackedAttachments([]);
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
      const newFile: TrackedAttachment = {
        name: res.data?.file_name || file.name,
        url: res.data?.file_url || "",
        unique_name: res.data?.unique_file_name || "",
        type: "FILE",
        status: "new",
      };
      setTrackedAttachments((prevValue) => [...prevValue, newFile]);
      toast.success("File berhasil diupload");
    } catch {
      toast.error("File gagal diupload");
    } finally {
      setIsPendingUploadFile(false);
    }
  };

  const handleDeleteFile = async (uniqueFileName: string) => {
    const file = trackedAttachments.find(
      (f) => f.unique_name === uniqueFileName,
    );
    if (!file) return;
    if (file.status === "new") {
      try {
        await deleteFileMaterial(uniqueFileName);
      } catch {
        toast.error("Gagal menghapus file")
      }
      setTrackedAttachments((prevValue) =>
        prevValue.filter((f) => f.unique_name !== uniqueFileName),
      );
    } else {
      setTrackedAttachments((prevValue) =>
        prevValue.map((f) =>
          f.unique_name === uniqueFileName
            ? { ...f, status: "deleted" }
            : f,
        ),
      );
    }
  };

  return {
    trackedAttachments,
    setTrackedAttachments,
    isPending,
    pdfMateriRef,
    handleMaterialForm,
    materialForm,
    handleUploadFile,
    handleDeleteFile,
    isPendingUploadFile,
    handleClose,
    initializeAttachments,
    getCurrentFiles: () =>
      trackedAttachments.filter((f) => f.status !== "deleted"),
  };
};

export default useEditMaterialDialog;
