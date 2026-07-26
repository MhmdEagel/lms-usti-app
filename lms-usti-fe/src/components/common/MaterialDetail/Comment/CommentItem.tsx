"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import DOMPurify from "isomorphic-dompurify";
import type { IComment } from "@/types/Classroom";
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

dayjs.extend(relativeTime);
dayjs.locale("id");

interface PropTypes {
  comment: IComment;
  currentId: string;
  currentRole: string;
  onDelete: (commentId: string) => void;
  isDeleting: boolean;
}

export default function CommentItem({
  comment,
  currentId,
  currentRole,
  onDelete,
  isDeleting,
}: PropTypes) {
  const initials = comment.user.fullname
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const canDelete =
    currentRole === "PRODI" || comment.created_by === currentId;

  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={comment.user.profile} alt={comment.user.fullname} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{comment.user.fullname}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={"text-[10px] font-semibold px-1.5 py-0.5 rounded " + (comment.user.role === "DOSEN" ? "bg-blue-100 text-blue-700" : comment.user.role === "MAHASISWA" ? "bg-green-100 text-green-700" : comment.user.role === "PRODI" ? "bg-purple-100 text-purple-700" : comment.user.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground")}>{comment.user.role}</span>
          <span className="text-xs text-muted-foreground">
            {dayjs(comment.created_at).fromNow()}
          </span>
        </div>
        <div
          className="prose prose-sm max-w-none mt-1"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(comment.content),
          }}
        />
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Komentar</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus komentar ini? Tindakan ini
                  tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(comment.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
