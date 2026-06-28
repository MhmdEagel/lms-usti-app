"use client";

import { deleteAssignment } from "@/actions/delete-assignment";
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
  assignmentId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
export default function DeleteAssignmentDialog(props: PropTypes) {
  const { classroomId, assignmentId, open, setOpen } = props;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tugas yang sudah dihapus tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              startTransition(async () => {
                await deleteAssignment(classroomId, assignmentId);
                router.push(`/dosen/kelas/${classroomId}/tugas`);
                toast.success("Tugas berhasil dihapus");
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
