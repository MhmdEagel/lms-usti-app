"use client";

import { materialServices } from "@/services/material.service";
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
import { useRouter } from "next/navigation";

import { Dispatch, SetStateAction, useTransition } from "react";
import { toast } from "sonner";

interface PropTypes {
  classroomId: string;
  materialId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
export default function DeleteMaterialDialog(props: PropTypes) {
  const { classroomId, materialId, open, setOpen } = props;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Materi yang sudah dihapus tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              startTransition(async () => {
                try {
                  await materialServices.delete(classroomId, materialId);
                  router.refresh();
                  toast.success("Materi berhasil dihapus");
                } catch {
                  toast.error("Gagal menghapus materi");
                }
              })
            }
            disabled={isPending}
          >
            {isPending ? <Spinner variant="circle" color="white" /> : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
