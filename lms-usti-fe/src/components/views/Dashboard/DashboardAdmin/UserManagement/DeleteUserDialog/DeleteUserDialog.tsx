"use client";

import { deleteUser } from "@/actions/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useTransition } from "react";
import { toast } from "sonner";

type DeleteUserDialogProps = {
  userId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export default function DeleteUserDialog({ userId, isOpen, setIsOpen }: DeleteUserDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () =>
    startTransition(async () => {
      try {
        await deleteUser(userId);
        toast.success("User berhasil dihapus");
        setIsOpen(false);
      } catch {
        toast.error("Gagal menghapus user");
      }
    });

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            User yang sudah dihapus tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? <Spinner variant="circle" color="white" /> : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
