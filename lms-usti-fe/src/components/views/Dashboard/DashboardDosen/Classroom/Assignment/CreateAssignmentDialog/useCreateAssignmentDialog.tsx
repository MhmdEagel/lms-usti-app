"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createAssignmentSchema } from "@/schemas/assignment";
import { z } from "zod";
import { IAttachment } from "@/types/Classroom";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/Response";
import { assignmentServices } from "@/services/assignment.service";
import { mediaServices } from "@/services/media.service";

const useCreateAssignmentDialog = (defaultMeetingId?: string) => {
  const router = useRouter();
  const [open, setOpen] = useState("closed");
  const [attachments, setAttachments] = useState<IAttachment[]>([]);

  const [hasDeadline, setHasDeadline] = useState(false);

  const handleSetHasDeadline = (checked: boolean) => {
    setHasDeadline(checked);
    if (checked) {
      assignmentForm.setValue("lateSubmission", "allow");
    } else {
      assignmentForm.setValue("lateSubmission", null);
    }
  };
  const [isPending, setIsPending] = useState(false);
  const [isPendingUploadFile, setIsPendingUploadFile] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(defaultMeetingId || null);

  const assignmentForm = useForm({
    defaultValues: {
      title: "",
      instruction: "",
      deadline: "",
      lateSubmission: null,
      meeting_id: defaultMeetingId || null,
    },
    resolver: zodResolver(createAssignmentSchema),
  });

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    formData.append("file", blob, file.name);
    try {
      setIsPendingUploadFile(true);
      const res = await mediaServices.uploadAssignment(formData);
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
    const payload: Record<string, unknown> = {
      title: data.title,
      meeting_id: meetingId || data.meeting_id || null,
      deadline: data.deadline || undefined,
      instruction: data.instruction || undefined,
      attachments,
    };
    if (hasDeadline && data.lateSubmission) {
      payload.late_submission = data.lateSubmission;
    }

    try {
      await assignmentServices.create(payload, classroomId);
      toast.success("Berhasil menambahkan tugas");
      setAttachments([]);
      setHasDeadline(false);
      setMeetingId(defaultMeetingId || null);
      assignmentForm.reset();
      setOpen("closed");
      router.refresh();
    } catch (e) {
      toast.error("Terjadi Kesalahan");
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
        await mediaServices.deleteAssignmentBatch({ files: filesToDelete.map(f => f.url) });
      }
    } catch (e) {
      const err = e as AxiosError<ErrorResponse>;
      toast.error(err.response?.data.meta.message);
    }
    setAttachments([]);
    setHasDeadline(false);
    setMeetingId(defaultMeetingId || null);
    setIsPending(false);
    assignmentForm.reset();
    setOpen("closed");
  };

  return {
    open,
    setOpen,

    hasDeadline,
    setHasDeadline: handleSetHasDeadline,

    attachments,
    setAttachments,

    setIsPending,
    isPending,

    handleAssignmentForm,
    handleClose,

    assignmentForm,

    handleUploadFile,
    isPendingUploadFile,
    setIsPendingUploadFile,

    meetingId,
    setMeetingId,
  };
};

export default useCreateAssignmentDialog;
