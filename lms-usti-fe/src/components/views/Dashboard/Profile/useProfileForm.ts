"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfileSchema } from "@/schemas/profile";
import { updateProfile } from "@/actions/profile";
import { toast } from "sonner";
import type { IUpdateProfileRequest } from "@/types/Auth";

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

export const useProfileForm = (user: {
  fullname: string;
  email: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullname: user.fullname,
      email: user.email,
    },
  });

  const handleEdit = async (values: UpdateProfileForm) => {
    setIsPending(true);
    try {
      const data: IUpdateProfileRequest = {};
      if (values.fullname !== user.fullname) data.fullname = values.fullname;
      if (values.email !== user.email) data.email = values.email;
      if (Object.keys(data).length === 0) {
        setIsEditing(false);
        return;
      }
      await updateProfile(data);
      toast.success("Profil berhasil diperbarui");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui profil");
    } finally {
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return {
    isEditing,
    isPending,
    form,
    handleEdit,
    handleCancel,
    setIsEditing,
  };
};
