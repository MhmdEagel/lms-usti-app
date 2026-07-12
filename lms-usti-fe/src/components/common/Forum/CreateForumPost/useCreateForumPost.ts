"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createForumPost } from "@/actions/create-public-forum-post";
import { createForumPostSchema, type CreateForumPostForm } from "@/schemas/forum";

export function useCreateForumPost() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CreateForumPostForm>({
    resolver: zodResolver(createForumPostSchema),
    defaultValues: { title: "", content: "" },
  });

  const handleSubmit = async (values: CreateForumPostForm) => {
    setIsPending(true);
    const res = await createForumPost({
      title: values.title,
      content: values.content ?? "",
    });
    setIsPending(false);
    if (res.success) {
      toast.success(res.success);
      form.reset();
      setOpen(false);
    } else if (res.error) {
      toast.error(res.error);
    }
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  return { form, open, setOpen, isPending, handleSubmit, handleClose };
}
