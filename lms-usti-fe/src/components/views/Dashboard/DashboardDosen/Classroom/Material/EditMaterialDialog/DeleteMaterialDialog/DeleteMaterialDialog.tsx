"use client";

import { deleteMaterial } from "@/actions/delete-material";
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
            Item yang sudah dihapus tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              startTransition(async () => {
                await deleteMaterial(classroomId, materialId);
                router.push(`/dosen/kelas/${classroomId}/materi`);
                toast.success("Materi berhasil dihapus");
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
