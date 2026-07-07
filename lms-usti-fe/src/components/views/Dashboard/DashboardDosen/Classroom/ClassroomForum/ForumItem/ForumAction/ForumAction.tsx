"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Spinner } from "@/components/ui/spinner";
import { deleteAnnoucement } from "@/actions/delete-announcement";
import { updateAnnouncement } from "@/actions/update-announcement";
import { IAnnouncement } from "@/types/Classroom";
import { EllipsisVertical, Pin, PinOff, Pencil, Trash } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface PropTypes {
  announcement: IAnnouncement;
  classroomId: string;
  onEdit?: () => void;
}

export default function ForumAction(props: PropTypes) {
  const { announcement, classroomId, onEdit } = props;
  const [openPopOver, setOpenPopOver] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handlePinToggle = () => {
    startTransition(async () => {
      try {
        await updateAnnouncement(
          classroomId,
          announcement.id,
          { is_pinned: !announcement.is_pinned },
        );
        toast.success(
          announcement.is_pinned
            ? "Pengumuman di-unpin"
            : "Pengumuman di-pin",
        );
        setOpenPopOver(false);
      } catch {
        toast.error("Gagal mengubah status pin");
      }
    });
  };

  return (
    <>
      <Popover open={openPopOver} onOpenChange={setOpenPopOver}>
        <PopoverTrigger asChild>
          <Button
            className="ml-auto"
            type="button"
            variant="ghost"
            size="icon"
          >
            <EllipsisVertical />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-fit p-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => {
                onEdit?.();
                setOpenPopOver(false);
              }}
              type="button"
              className="block text-left w-full"
            >
              <Pencil className="inline mr-2 size-4" /> Edit
            </Button>
            <Button
              variant="ghost"
              onClick={handlePinToggle}
              type="button"
              className="block text-left w-full"
              disabled={isPending}
            >
              {announcement.is_pinned ? (
                <>
                  <PinOff className="inline mr-2 size-4" /> Unpin
                </>
              ) : (
                <>
                  <Pin className="inline mr-2 size-4" /> Pin
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setOpenDeleteDialog(true);
                setOpenPopOver(false);
              }}
              type="button"
              className="block text-left w-full"
            >
              <Trash className="inline mr-2 size-4" /> Hapus
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogTrigger asChild>
          <span />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengumuman</AlertDialogTitle>
            <AlertDialogDescription>
              Pengumuman yang dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                startTransition(async () => {
                  await deleteAnnoucement(classroomId, announcement.id);
                  toast.success("Pengumuman berhasil dihapus");
                })
              }
              disabled={isPending}
            >
              {isPending ? (
                <Spinner variant="circle" color="white" />
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
