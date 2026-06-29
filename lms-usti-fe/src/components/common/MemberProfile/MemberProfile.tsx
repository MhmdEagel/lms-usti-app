"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import MemberProfileBreadcrumb from "./MemberProfileBreadcrumb";
import Link from "next/link";
import { removeMember } from "@/actions/remove-member";
import { useState } from "react";

export default function MemberProfile({
  userId,
  fullname,
  profile,
  email,
  nim,
  role,
  classroomId,
  className,
  viewerRole,
}: {
  userId: string;
  fullname: string;
  profile?: string;
  email: string;
  nim?: string;
  role?: string;
  classroomId: string;
  className: string;
  viewerRole: "DOSEN" | "MAHASISWA";
}) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeMember(classroomId, userId);
      router.push(`/${viewerRole.toLowerCase()}/kelas/${classroomId}/anggota`);
    } catch {
      setRemoving(false);
    }
  };

  return (
    <div className="p-4">
      <MemberProfileBreadcrumb
        classroomId={classroomId}
        classroomName={className}
        profileId={userId}
        profileName={fullname}
        role={viewerRole}
      />

      <Link
        className="mb-6"
        href={`/${viewerRole.toLowerCase()}/kelas/${classroomId}/anggota`}
      >
        <Button className="rounded-full" variant={"ghost"}>
          <ArrowLeft /> Kembali
        </Button>
      </Link>

      <Card className="border">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="size-24">
              <AvatarImage src={profile || ""} alt={fullname} />
              <AvatarFallback className="text-2xl">
                {fullname?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-lg font-semibold">{fullname}</div>
          </div>

          <div>
            <div className="font-bold text-sm mb-1">INFORMASI</div>
            <hr className="mb-3" />

            <div className="space-y-3">
              <div>
                <div className="font-semibold text-sm">Nama</div>
                <div className="text-muted-foreground">{fullname}</div>
              </div>
              {nim && (
                <div>
                  <div className="font-semibold text-sm">
                    {role === "DOSEN" ? "NIDN" : "NIM"}
                  </div>
                  <div className="text-muted-foreground">{nim}</div>
                </div>
              )}
              <div>
                <div className="font-semibold text-sm">Email</div>
                <div className="text-muted-foreground">{email}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-sm mb-1">AKSI</div>
            <hr className="mb-3" />

            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-1">
                <a href={`mailto:${email}`}>
                  <Mail className="size-4" />
                  Kirim Email
                </a>
              </Button>

              {viewerRole === "DOSEN" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <ExternalLink className="size-4" />
                      Keluarkan dari Kelas
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Keluarkan Anggota</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah anda yakin ingin mengeluarkan {fullname} dari
                        kelas ini? Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleRemove}
                        disabled={removing}
                      >
                        {removing ? "Mengeluarkan..." : "Keluarkan"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
