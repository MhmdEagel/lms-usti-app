"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { classroomServices } from "@/services/classroom.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PropTypes {
  classroomId: string;
}

export default function ArchiveClassroomDialog({ classroomId }: PropTypes) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleArchive = async () => {
    setIsPending(true);
    try {
      await classroomServices.archive(classroomId);
      toast.success("Kelas berhasil diarsipkan");
      setIsOpen(false);
      router.push("/dosen/kelas");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="border border-destructive text-destructive hover:bg-destructive hover:text-white"
          variant="outline"
        >
          Arsipkan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Arsipkan Kelas?</AlertDialogTitle>
          <AlertDialogDescription>
            Kelas yang diarsipkan tidak akan tampil di daftar kelas aktif. Kamu
            masih dapat melihatnya dan mengeluarkannya dari arsip nanti jika
            diperlukan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleArchive}
          >
            {isPending ? "Mengarsipkan..." : "Arsipkan"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
