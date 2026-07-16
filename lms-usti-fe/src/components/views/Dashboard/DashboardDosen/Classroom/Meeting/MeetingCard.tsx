"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Book, FileText, Plus, Pencil, Trash2 } from "lucide-react";
import MaterialItem from "../Material/MaterialItem/MaterialItem";
import AssignmentItem from "../Assignment/AssignmentItem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { meetingServices } from "@/services/meeting.service";
import CreateMeetingDialog from "./CreateMeetingDialog/CreateMeetingDialog";
import CreateMaterialDialog from "../Material/CreateMaterialDialog/CreateMaterialDialog";
import CreateAssignmentDialog from "../Assignment/CreateAssignmentDialog/CreateAssignmentDialog";
import type { IMeeting } from "@/types/Classroom";

interface PropTypes {
  meeting: IMeeting;
  type: "dosen" | "mahasiswa";
  classroomId: string;
}

export default function MeetingCard({ meeting, type, classroomId }: PropTypes) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isDosen = type === "dosen";
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await meetingServices.deleteMeeting(classroomId, meeting.id);
      toast.success("Pertemuan berhasil dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus pertemuan");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden py-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center justify-between px-2 hover:bg-accent/50 transition-colors text-left min-w-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0">
              {expanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm sm:text-base">
                Pertemuan {meeting.position}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {meeting.topic}
              </div>
            </div>
          </div>
        </button>
        {isDosen && (
          <div className="pr-4 shrink-0 flex items-center gap-1">
            <CreateMeetingDialog
              classroomId={classroomId}
              meeting={meeting}
              trigger="icon"
            />
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Hapus Pertemuan</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Pertemuan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus pertemuan &quot;{meeting.topic}&quot;? Semua materi dan tugas di dalam pertemuan ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {deleting ? "Menghapus..." : "Hapus"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {expanded && (
        <CardContent className="border-t px-4 py-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Book className="h-4 w-4" />
                Materi
              </h4>
              {isDosen && (
                <CreateMaterialDialog
                  classroomId={classroomId}
                  defaultMeetingId={meeting.id}
                />
              )}
            </div>
            <div className="border-b mb-3" />
            {meeting.materials && meeting.materials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {meeting.materials.map((mat) => (
                  <MaterialItem
                    key={mat.id}
                    materialId={mat.id}
                    title={mat.title}
                    createdAt={mat.created_at}
                    type={type}
                    classroomId={classroomId}
                    compact
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada materi</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tugas
              </h4>
              {isDosen && (
                <CreateAssignmentDialog
                  classroomId={classroomId}
                  defaultMeetingId={meeting.id}
                />
              )}
            </div>
            <div className="border-b mb-3" />
            {meeting.assignments && meeting.assignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {meeting.assignments.map((tgs) => (
                  <AssignmentItem
                    key={tgs.id}
                    assignmentId={tgs.id}
                    title={tgs.title}
                    deadline={tgs.deadline}
                    type={type}
                    classroomId={classroomId}
                    compact
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada tugas</p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}