"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfileSchema } from "@/schemas/profile";
import profileServices from "@/services/profile.service";
import { mediaServices } from "@/services/media.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { IUpdateProfileRequest } from "@/types/Auth";

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

export const useProfileForm = (user: {
  fullname: string;
  email: string;
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      await profileServices.updateProfile(data);
      toast.success("Profil berhasil diperbarui");
      setIsEditing(false);
      router.refresh();
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

  const handleUploadPicture = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan (jpg, jpeg, png, gif, webp)");
      return;
    }
    setIsUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await mediaServices.uploadProfilePicture(formData);
      const fileUrl: string = res.data.data?.file_url || res.data.file_url;
      setPreviewUrl(fileUrl);
      await profileServices.updateProfile({ profile: fileUrl });
      toast.success("Foto profil berhasil diperbarui");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengupload foto");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  return {
    isEditing,
    isPending,
    isUploadingPicture,
    previewUrl,
    form,
    handleEdit,
    handleCancel,
    setIsEditing,
    handleUploadPicture,
    fileInputRef,
  };
};
