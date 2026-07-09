"use client";

import { deleteForumPost } from "@/actions/delete-forum-post";
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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { Trash } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface PropTypes {
  forumPostId: string;
  classroomId: string;
}

export default function DeleteAction(props: PropTypes) {
  const { forumPostId, classroomId } = props;
  const [isPending, startTransition] = useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="ml-auto"
          type="button"
          variant={"outline"}
          size={"icon"}
        >
          <Trash />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Materi</AlertDialogTitle>
          <AlertDialogDescription>
            Item yang dihapus tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              startTransition(async () => {
                await deleteForumPost(classroomId, forumPostId);
                toast.success("Pengumuman berhasil dihapus")
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
