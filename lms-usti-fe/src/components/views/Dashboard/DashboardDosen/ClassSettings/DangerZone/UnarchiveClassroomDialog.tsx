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

export default function UnarchiveClassroomDialog({ classroomId }: PropTypes) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleUnarchive = async () => {
    setIsPending(true);
    try {
      await classroomServices.unarchive(classroomId);
      toast.success("Kelas berhasil dikeluarkan dari arsip");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className="border border-destructive text-destructive hover:bg-destructive hover:text-white" variant="outline">
          Keluarkan dari Arsip
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Keluarkan Kelas dari Arsip?</AlertDialogTitle>
          <AlertDialogDescription>
            Kelas akan kembali tampil di daftar kelas aktif. Mahasiswa dapat
            kembali mengakses kelas seperti sebelumnya.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleUnarchive}
          >
            {isPending ? "Memproses..." : "Keluarkan dari Arsip"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
