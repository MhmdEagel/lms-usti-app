"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Pencil, Loader2 } from "lucide-react";
import { useProfileForm } from "./useProfileForm";
import ProfileEdit from "./ProfileEdit/ProfileEdit";

interface ProfileProps {
  user: {
    id: string;
    fullname: string;
    email: string;
    role: string;
    profile?: string;
    nim?: string;
    nidn?: string;
  };
}

export default function Profile({ user }: ProfileProps) {
  const {
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
  } = useProfileForm(user);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadPicture(file);
    }
    e.target.value = "";
  };

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Profil Saya
        </h1>
        {/* Card 1 — Info Pengguna */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="size-24 md:size-[96px]">
                  <AvatarImage src={previewUrl || user.profile || ""} alt={user.fullname} />
                  <AvatarFallback className="text-2xl md:text-4xl bg-primary text-white">
                    {user.fullname?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPicture}
                  className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition disabled:opacity-70"
                >
                  {isUploadingPicture ? (
                    <Loader2 className="size-4 text-white animate-spin" />
                  ) : (
                    <Camera className="size-4 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <div className="text-center">
                <h2 className="text-lg md:text-xl font-bold">
                  {user.fullname}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user.role === "MAHASISWA"
                    ? "Mahasiswa"
                    : user.role === "DOSEN"
                      ? "Dosen"
                      : "Admin"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 — Informasi Pribadi */}
        {isEditing ? (
          <ProfileEdit
            form={form}
            isPending={isPending}
            onCancel={handleCancel}
            onSubmit={handleEdit}
            role={user.role}
            nim={user.nim}
            nidn={user.nidn}
          />
        ) : (
          <Card className="shadow-sm rounded-xl">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-bold text-primary">
                  Informasi Pribadi
                </h3>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="size-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {user.role === "MAHASISWA" && (
                  <div>
                    <p className="text-sm text-muted-foreground">NIM</p>
                    <p className="text-base font-semibold">{user.nim || "-"}</p>
                  </div>
                )}
                {user.role === "DOSEN" && (
                  <div>
                    <p className="text-sm text-muted-foreground">NIDN</p>
                    <p className="text-base font-semibold">{user.nidn || "-"}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                  <p className="text-base font-semibold">{user.fullname}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-base font-semibold">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
