"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { classroomServices } from "@/services/classroom.service";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
  classroomName: string;
}

export default function  DeleteClassroomDialog({
  classroomId,
  classroomName,
}: PropTypes) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, setIsPending] = useState(false);

  const isConfirmed = confirmText === "HAPUS";

  const handleDelete = async () => {
    if (!isConfirmed || isPending) return;
    setIsPending(true);
    try {
      await classroomServices.delete(classroomId);
      toast.success("Kelas berhasil dihapus");
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
        <Button className="bg-white border border-destructive text-destructive hover:bg-destructive hover:text-white" variant={"outline"}>Hapus Kelas</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kelas?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Semua data berikut akan ikut
            terhapus secara permanen:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-1">
          <li>Materi pembelajaran</li>
          <li>Tugas dan submission mahasiswa</li>
          <li>Forum diskusi kelas</li>
          <li>Anggota kelas</li>
          <li>Pengaturan kelas</li>
        </ul>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Ketik{" "}
            <span className="font-bold">&quot;HAPUS&quot;</span> untuk
            konfirmasi
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Ketik "HAPUS"'
            autoComplete="off"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!isConfirmed || isPending}
            onClick={handleDelete}
          >
            {isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
