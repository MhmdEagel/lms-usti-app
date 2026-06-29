import { useRef, useState, useCallback, useEffect, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import type { IAttachment } from "@/types/Classroom";
import type { IMySubmission } from "@/types/Classroom";
import { uploadSubmission } from "@/actions/upload-submission";
import { deleteFileSubmission } from "@/actions/delete-file-submission";

type TrackStatus = "original" | "new" | "deleted";

export interface TrackedAttachment extends IAttachment {
  status: TrackStatus;
}

export default function useSubmitAssignmentDialog(mySubmission?: IMySubmission | null) {
  const [open, setOpen] = useState(false);
  const [trackedAttachments, setTrackedAttachments] = useState<TrackedAttachment[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isPendingUploadFile, setIsPendingUploadFile] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initializeAttachments = useCallback((existing: IMySubmission | null | undefined) => {
    const tracked: TrackedAttachment[] = (existing?.attachments || []).map((att) => ({
      name: att.name,
      type: att.type as "FILE" | "VIDEO" | "LINK",
      url: att.url,
      unique_name: att.unique_name,
      status: "original" as TrackStatus,
    }));
    setTrackedAttachments(tracked);
  }, []);

  useEffect(() => {
    if (open && mySubmission) {
      initializeAttachments(mySubmission);
    }
  }, [open, mySubmission, initializeAttachments]);

  const currentAttachments = trackedAttachments.filter((a) => a.status !== "deleted");

  const handleDeleteAttachment = async (item: TrackedAttachment) => {
    if (item.type === "FILE" || item.type === "VIDEO") {
      if (item.status === "new") {
        setIsPendingUploadFile(true);
        try {
          await deleteFileSubmission(item.unique_name);
          setTrackedAttachments((prev) =>
            prev.filter((a) => a.unique_name !== item.unique_name),
          );
        } finally {
          setIsPendingUploadFile(false);
        }
      } else {
        setTrackedAttachments((prev) =>
          prev.map((a) =>
            a.unique_name === item.unique_name
              ? { ...a, status: "deleted" as TrackStatus }
              : a,
          ),
        );
      }
    } else {
      setTrackedAttachments((prev) =>
        prev.filter((a) => a.id !== item.id),
      );
    }
  };

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    formData.append("file", blob, file.name);
    try {
      setIsPendingUploadFile(true);
      const res = await uploadSubmission(formData);
      const newFile: TrackedAttachment = {
        name: res.data?.file_name,
        url: res.data?.file_url,
        unique_name: res.data?.unique_file_name,
        type: "FILE",
        status: "new",
      };
      setTrackedAttachments((prev) => [...prev, newFile]);
      toast.success("File berhasil diupload");
    } catch {
      toast.error("File gagal diupload");
    } finally {
      setIsPendingUploadFile(false);
    }
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        await handleUploadFile(file);
      }
      e.target.value = "";
    }
  };

  const handleClose = async () => {
    setIsPending(true);
    try {
      const filesToDelete = trackedAttachments.filter(
        (a) => a.status === "new" && (a.type === "FILE" || a.type === "VIDEO"),
      );
      if (filesToDelete.length > 0) {
        await Promise.all(
          filesToDelete.map((f) => deleteFileSubmission(f.unique_name)),
        );
      }
    } catch {
      // silently fail
    }
    setTrackedAttachments([]);
    setIsPending(false);
    setOpen(false);
  };

  const setAttachments: Dispatch<SetStateAction<IAttachment[]>> = useCallback((value) => {
    const next = typeof value === "function" ? value(currentAttachments) : value;
    setTrackedAttachments(
      next.map((a) => ({
        ...a,
        status: ((a as TrackedAttachment).status ?? "new") as TrackStatus,
      })),
    );
  }, [currentAttachments]);

  return {
    open,
    setOpen,
    trackedAttachments,
    currentAttachments,
    setTrackedAttachments,
    setAttachments,
    isPending,
    setIsPending,
    isPendingUploadFile,
    linkDialogOpen,
    setLinkDialogOpen,
    fileInputRef,
    handleDeleteAttachment,
    handleUploadFile,
    handleFileInputChange,
    handleClose,
  };
}
