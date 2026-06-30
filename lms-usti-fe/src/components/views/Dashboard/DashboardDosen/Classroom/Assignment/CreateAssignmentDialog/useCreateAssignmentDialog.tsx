"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createAssignmentSchema } from "@/schemas/assignment";
import { newAssignment } from "@/actions/new-assignment";
import { z } from "zod";
import { uploadAssignment } from "@/actions/upload-assignment";
import { IAttachment } from "@/types/Classroom";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";
import { deleteMaterialBatch } from "@/actions/delete-material-batch";

const useCreateAssignmentDialog = () => {
  const [open, setOpen] = useState("closed");
  const [attachments, setAttachments] = useState<IAttachment[]>([]);

  const [hasDeadline, setHasDeadline] = useState(false);
  const [arrayOfRubrics, setArrayOfRubrics] = useState<
    { name: string; score: string }[]
  >([]);
  const [isPending, setIsPending] = useState(false);
  const [isPendingUploadFile, setIsPendingUploadFile] = useState(false);

  const [rubricName, setRubricName] = useState("");
  const [rubricValue, setRubricValue] = useState("");

  const totalScore = arrayOfRubrics.reduce(
    (sum, r) => sum + (parseInt(r.score) || 0),
    0,
  );
  const canAddRubric = totalScore < 100;

  const assignmentForm = useForm({
    defaultValues: {
      title: "",
      instruction: "",
      deadline: "",
      rubrics: [],
    },
    resolver: zodResolver(createAssignmentSchema),
  });

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

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    formData.append("file", blob, file.name);
    try {
      setIsPendingUploadFile(true);
      const res = await uploadAssignment(formData);
      const newFile: IAttachment = {
        name: res.data?.file_name,
        url: res.data?.file_url,
        unique_name: res.data?.unique_file_name,
        type: "FILE",
      };
      setAttachments((prevValue) => [...prevValue, newFile]);
      toast.success("File berhasil diupload");
    } catch (e) {
      const err = e as AxiosError<ErrorResponse>;
      toast.error("File gagal diupload");
    } finally {
      setIsPendingUploadFile(false);
    }
  };

  const handleAssignmentForm = async (
    data: z.infer<typeof createAssignmentSchema>,
    classroomId: string,
  ) => {
    setIsPending(true);
    const payload = {
      title: data.title,
      deadline: data.deadline || undefined,
      instruction: data.instruction || undefined,
      rubrics: data.rubrics
        ?.filter((r) => r.name && r.score)
        .map((r) => ({ name: r.name, score: parseInt(r.score) || 0 })) || [],
      attachments,
    };

    const res = await newAssignment(payload, classroomId);
    if (!res.success && res.error) {
      toast.error(res.error);
      setIsPending(false);
      return;
    }
    setIsPending(false);
    toast.success(res.success);
    setArrayOfRubrics([]);
    setAttachments([]);
    setHasDeadline(false);
    assignmentForm.reset();
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
    setArrayOfRubrics([]);
    setHasDeadline(false);
    setIsPending(false);
    assignmentForm.reset();
    setOpen("closed");
  };

  return {
    open,
    setOpen,

    hasDeadline,
    setHasDeadline,

    attachments,
    setAttachments,

    arrayOfRubrics,
    setArrayOfRubrics,

    setIsPending,
    isPending,

    handleAddRubric,
    handleAssignmentForm,
    handleClose,

    assignmentForm,

    rubricName,
    rubricValue,
    setRubricName,
    setRubricValue,
    totalScore,
    canAddRubric,

    handleUploadFile,
    isPendingUploadFile,
    setIsPendingUploadFile,
  };
};

export default useCreateAssignmentDialog;
