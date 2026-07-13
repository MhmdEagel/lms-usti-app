import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { IAttachment } from "@/types/Classroom";
import { createAssignmentSchema } from "@/schemas/assignment";
import { z } from "zod";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";
import { assignmentServices } from "@/services/assignment.service";
import { mediaServices } from "@/services/media.service";

type TrackStatus = "original" | "new" | "deleted";

export interface TrackedAttachment extends IAttachment {
  status: TrackStatus;
}

const useEditAssignmentDialog = () => {
  const router = useRouter();
  const [trackedAttachments, setTrackedAttachments] = useState<TrackedAttachment[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isPendingUploadFile, setIsPendingUploadFile] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);

  const assignmentForm = useForm({
    defaultValues: {
      attachments: [],
    },
    resolver: zodResolver(createAssignmentSchema),
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
    assignmentForm.setValue("attachments", nonDeleted as IAttachment[]);
  }, [trackedAttachments]);

  const orphanedNewFilesRef = useRef<Set<string>>(new Set());

  const resetState = (setOpen: Dispatch<SetStateAction<string>>) => {
    setTrackedAttachments([]);
    setHasDeadline(false);
    setIsPending(false);
    setOpen("closed");
  };

  const handleAssignmentForm = async (
    data: z.infer<typeof createAssignmentSchema>,
    classroomId: string,
    assignmentId: string,
    setOpen: Dispatch<SetStateAction<string>>,
  ) => {
    console.log(data)
    try {
      setIsPending(true);
      const payload = {
        title: data.title,
        deadline: hasDeadline ? data.deadline : null,
        instruction: data.instruction || undefined,
        attachments: trackedAttachments.filter((f) => f.status !== "deleted"),
      };
      await assignmentServices.update(payload, classroomId, assignmentId);
      const deletedFiles = trackedAttachments.filter(
        (f) => f.status === "deleted" && f.unique_name,
      );
      if (deletedFiles.length > 0) {
        await mediaServices.deleteAssignmentBatch({ files: deletedFiles.map(f => f.url) });
      }
      for (const uniqueName of orphanedNewFilesRef.current) {
        try {
          await mediaServices.deleteAssignment(uniqueName);
        } catch {
          console.error("Failed to delete orphaned file:", uniqueName);
        }
      }
      orphanedNewFilesRef.current.clear();
      toast.success("Berhasil mengubah tugas");
      resetState(setOpen);
      router.refresh();
    } catch (e) {
      toast.error("Gagal mengubah tugas");
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = async (setOpen: Dispatch<SetStateAction<string>>) => {
    const newFiles = trackedAttachments.filter(
      (f) => f.status === "new" && f.type !== "LINK",
    );
    const allOrphans = [
      ...newFiles,
      ...Array.from(orphanedNewFilesRef.current).map((name) => ({
        unique_name: name,
      })),
    ];
    if (allOrphans.length > 0) {
      try {
        for (const file of allOrphans) {
          await mediaServices.deleteAssignment(file.unique_name);
        }
      } catch {
        console.error("Failed to delete new files");
      }
    }
    orphanedNewFilesRef.current.clear();
    resetState(setOpen);
  };

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    formData.append("file", blob, file.name);
    try {
      setIsPendingUploadFile(true);
      const res = await mediaServices.uploadAssignment(formData);
      const newFile: TrackedAttachment = {
        name: res.data?.file_name || file.name,
        url: res.data?.file_url || "",
        unique_name: res.data?.unique_file_name || "",
        type: "FILE",
        status: "new",
      };
      setTrackedAttachments((prevValue) => [...prevValue, newFile]);
      toast.success("File berhasil diupload");
    } catch (e) {
      const err = e as AxiosError<ErrorResponse>;
      toast.error("File gagal diupload");
    } finally {
      setIsPendingUploadFile(false);
    }
  };

  const handleDeleteFile = (uniqueFileName: string) => {
    const file = trackedAttachments.find(
      (f) => f.unique_name === uniqueFileName,
    );
    if (!file) return;
    if (file.status === "new") {
      orphanedNewFilesRef.current.add(uniqueFileName);
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
    isPendingUploadFile,
    handleAssignmentForm,
    assignmentForm,
    handleUploadFile,
    handleDeleteFile,
    handleClose,
    initializeAttachments,
    hasDeadline,
    setHasDeadline,
  };
};

export default useEditAssignmentDialog;
