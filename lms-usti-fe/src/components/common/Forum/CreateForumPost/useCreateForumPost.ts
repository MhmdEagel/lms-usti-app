"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { forumServices } from "@/services/forum.service";
import { createForumPostSchema, type CreateForumPostForm } from "@/schemas/forum";
import { useRouter } from "next/navigation";

export function useCreateForumPost() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CreateForumPostForm>({
    resolver: zodResolver(createForumPostSchema),
    defaultValues: { title: "", content: "" },
  });

  const handleSubmit = async (values: CreateForumPostForm) => {
    setIsPending(true);
    try {
      await forumServices.createPost({
        title: values.title,
        content: values.content ?? "",
      });
      toast.success("Postingan berhasil dibuat");
      form.reset();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Gagal membuat postingan");
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
