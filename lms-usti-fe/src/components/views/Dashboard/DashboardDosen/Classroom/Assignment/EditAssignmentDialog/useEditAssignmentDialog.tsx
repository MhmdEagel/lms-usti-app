import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { IAttachment } from "@/types/Classroom";
import { createAssignmentSchema } from "@/schemas/assignment";
import { uploadAssignment } from "@/actions/upload-assignment";
import { z } from "zod";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";
import { deleteAssignmentBatch } from "@/actions/delete-assignment-batch";
import { editAssignment } from "@/actions/edit-assignment";
import { deleteFileAssignment } from "@/actions/delete-file-assignment";

type TrackStatus = "original" | "new" | "deleted";

export interface TrackedAttachment extends IAttachment {
  status: TrackStatus;
}

const useEditAssignmentDialog = () => {
  const [trackedAttachments, setTrackedAttachments] = useState<TrackedAttachment[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isPendingUploadFile, setIsPendingUploadFile] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [arrayOfRubrics, setArrayOfRubrics] = useState<
    { name: string; score: string }[]
  >([]);
  const [rubricName, setRubricName] = useState("");
  const [rubricValue, setRubricValue] = useState("");

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

  const totalScore = arrayOfRubrics.reduce(
    (sum, r) => sum + (parseInt(r.score) || 0),
    0,
  );
  const canAddRubric = totalScore < 100;

  useEffect(() => {
    assignmentForm.setValue("rubrics", arrayOfRubrics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrayOfRubrics]);

  const handleAddRubric = (rubricName: string, rubricScore: string) => {
    setArrayOfRubrics((prev) => [
      ...prev,
      { name: rubricName, score: rubricScore },
    ]);
    setRubricName("");
    setRubricValue("");
  };

  const orphanedNewFilesRef = useRef<Set<string>>(new Set());

  const resetState = (setOpen: Dispatch<SetStateAction<string>>) => {
    setTrackedAttachments([]);
    setArrayOfRubrics([]);
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
    try {
      setIsPending(true);
      const payload = {
        title: data.title,
        deadline: data.deadline || undefined,
        instruction: data.instruction || undefined,
        rubrics: data.rubrics
          ?.filter((r) => r.name && r.score)
          .map((r) => ({ name: r.name, score: parseInt(r.score) || 0 })) || [],
        attachments: trackedAttachments.filter((f) => f.status !== "deleted"),
      };
      await editAssignment(payload, classroomId, assignmentId);
      const deletedFiles = trackedAttachments.filter(
        (f) => f.status === "deleted" && f.unique_name,
      );
      if (deletedFiles.length > 0) {
        await deleteAssignmentBatch(deletedFiles);
      }
      for (const uniqueName of orphanedNewFilesRef.current) {
        try {
          await deleteFileAssignment(uniqueName);
        } catch {
          console.error("Failed to delete orphaned file:", uniqueName);
        }
      }
      orphanedNewFilesRef.current.clear();
      toast.success("Berhasil mengubah tugas");
      resetState(setOpen);
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
          await deleteFileAssignment(file.unique_name);
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
      const res = await uploadAssignment(formData);
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
    arrayOfRubrics,
    setArrayOfRubrics,
    handleAddRubric,
    rubricName,
    rubricValue,
    setRubricName,
    setRubricValue,
    totalScore,
    canAddRubric,
  };
};

export default useEditAssignmentDialog;
