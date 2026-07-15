"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { meetingServices } from "@/services/meeting.service";
import { createMeetingSchema } from "@/schemas/meeting";
import { useRouter } from "next/navigation";
import { z } from "zod";
import type { IMeeting } from "@/types/Classroom";

type CreateMeetingForm = z.infer<typeof createMeetingSchema>;

export function useCreateMeetingDialog(classroomId: string, meeting?: IMeeting) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const isEdit = !!meeting;

  const form = useForm<CreateMeetingForm>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: { topic: "", description: "" },
  });

  useEffect(() => {
    if (open && meeting) {
      form.reset({ topic: meeting.topic, description: meeting.description });
    }
  }, [open, meeting, form]);

  const handleSubmit = async (values: CreateMeetingForm) => {
    setIsPending(true);
    try {
      if (isEdit && meeting) {
        await meetingServices.updateMeeting(classroomId, meeting.id, {
          topic: values.topic,
          description: values.description || undefined,
        });
        toast.success("Pertemuan berhasil diperbarui");
      } else {
        await meetingServices.createMeeting(classroomId, {
          topic: values.topic,
          description: values.description || undefined,
        });
        toast.success("Pertemuan berhasil dibuat");
      }
      form.reset();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(isEdit ? "Gagal memperbarui pertemuan" : "Gagal membuat pertemuan");
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  return { form, open, setOpen, isPending, handleSubmit, handleClose, isEdit };
}