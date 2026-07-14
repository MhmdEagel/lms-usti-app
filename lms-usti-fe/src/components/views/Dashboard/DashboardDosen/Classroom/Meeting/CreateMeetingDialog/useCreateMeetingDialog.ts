"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { meetingServices } from "@/services/meeting.service";
import { createMeetingSchema } from "@/schemas/meeting";
import { useRouter } from "next/navigation";
import { z } from "zod";

type CreateMeetingForm = z.infer<typeof createMeetingSchema>;

export function useCreateMeetingDialog(classroomId: string) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CreateMeetingForm>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: { topic: "", description: "" },
  });

  const handleSubmit = async (values: CreateMeetingForm) => {
    setIsPending(true);
    try {
      await meetingServices.createMeeting(classroomId, {
        topic: values.topic,
        description: values.description || undefined,
      });
      toast.success("Pertemuan berhasil dibuat");
      form.reset();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Gagal membuat pertemuan");
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  return { form, open, setOpen, isPending, handleSubmit, handleClose };
}
