"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { classroomServices } from "@/services/classroom.service";

interface PropTypes {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroomId: string;
  className: string;
  onDelete: () => void;
}

export default function DeleteClassroomDialog({
  open,
  onOpenChange,
  classroomId,
  className,
  onDelete,
}: PropTypes) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await classroomServices.delete(classroomId);
      toast.success("Kelas berhasil dihapus");
      onDelete();
      onOpenChange(false);
    } catch {
      toast.error("Gagal menghapus kelas");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kelas</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus kelas <strong>{className}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
