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

interface TrackedFile extends IAttachment {
  status: TrackStatus;
}
interface TrackedLink extends IAttachment {
  status: TrackStatus;
}

const useEditMaterialDialog = () => {
  const [trackedFiles, setTrackedFiles] = useState<TrackedFile[]>([]);
  const [trackedLinks, setTrackedLinks] = useState<TrackedLink[]>([])
  const [arrayOfLinks, setArrayOfLinks] = useState<IAttachment[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isPendingUploadFile, setIsPendingUploadFile] = useState(false);
  const materialForm = useForm({
    defaultValues: {
      files: [],
      links: [],
    },
    resolver: zodResolver(createMaterialSchema),
  });

  const initializeFiles = (files: IAttachment[]) => {
    const tracked: TrackedFile[] = files.map((file) => ({
      ...file,
      type: "FILE",
      status: "original" as TrackStatus,
    }));
    setTrackedFiles(tracked);
  };

  const initializeLinks = (links: IAttachment[]) => {
    const tracked: TrackedLink[] = links.map((link) => ({
      ...link,
      type: "LINK",
      status: "original" as TrackStatus,
    }));
    setTrackedLinks(tracked);
  };


  useEffect(() => {
    const nonDeletedFiles = trackedFiles.filter((f) => f.status !== "deleted");
    materialForm.setValue("files", nonDeletedFiles);
  }, [trackedFiles]);

  const pdfMateriRef = useRef<HTMLInputElement>(null);



  const getCurrentFiles = () => {
    return trackedFiles.filter((f) => f.status !== "deleted");
  };

  const handleMaterialForm = async (
    data: z.infer<typeof newMaterialSchema>,
    classroomId: string,
    materialId: string,
    setOpen: Dispatch<SetStateAction<string>>,
  ) => {
    try {
      setIsPending(true);
      console.log(data)
      await editMaterial(data, classroomId, materialId);
      const deletedFiles = trackedFiles.filter((f) => f.status === "deleted");
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
    const newFiles = trackedFiles.filter((f) => f.status === "new");
    if (newFiles.length > 0) {
      try {
        for (const file of newFiles) {
          await deleteFileMaterial(file.unique_name);
        }
      } catch {
        console.error("Failed to delete new files");
      }
    }
    setTrackedFiles([]);
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
      const newFile: TrackedFile = {
        name: res.data?.file_name || file.name,
        url: res.data?.file_url || "",
        unique_name: res.data?.unique_file_name || "",
        type: "FILE",
        status: "new",
      };
      setTrackedFiles((prevValue) => [...prevValue, newFile]);
      toast.success("File berhasil diupload");
    } catch {
      toast.error("File gagal diupload");
    } finally {
      setIsPendingUploadFile(false);
    }
  };

  const handleDeleteFile = async (uniqueFileName: string) => {
    const file = trackedFiles.find(
      (f) => f.unique_name === uniqueFileName,
    );
    if (!file) return;
    if (file.status === "new") {
      try {
        await deleteFileMaterial(uniqueFileName);
      } catch {
        toast.error("Gagal menghapus file")
      }
      setTrackedFiles((prevValue) =>
        prevValue.filter((f) => f.unique_name !== uniqueFileName),
      );
    } else {
      setTrackedFiles((prevValue) =>
        prevValue.map((f) =>
          f.unique_name === uniqueFileName
            ? { ...f, status: "deleted" }
            : f,
        ),
      );
    }
  };

  

  return {
    trackedFiles,
    trackedLinks,
    arrayOfLinks,
    setArrayOfLinks,
    isPending,
    pdfMateriRef,
    handleMaterialForm,
    materialForm,
    handleUploadFile,
    handleDeleteFile,
    isPendingUploadFile,
    handleClose,
    initializeFiles,
    initializeLinks,
    getCurrentFiles,
  };
};

export default useEditMaterialDialog;
