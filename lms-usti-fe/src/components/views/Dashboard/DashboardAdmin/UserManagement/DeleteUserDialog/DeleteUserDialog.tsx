"use client";

import adminServices from "@/services/admin.service";
import { useRouter } from "next/navigation";
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
  id: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export default function DeleteUserDialog({ id, isOpen, setIsOpen }: DeleteUserDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () =>
    startTransition(async () => {
      try {
        await adminServices.deleteUser(id);
        toast.success("User berhasil dihapus");
        setIsOpen(false);
        router.refresh();
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
