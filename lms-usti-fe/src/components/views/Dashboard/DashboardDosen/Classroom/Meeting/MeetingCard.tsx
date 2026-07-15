"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Book, FileText, Plus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
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
  const isDosen = type === "dosen";

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left min-w-0"
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
          <div className="pr-4 shrink-0">
            <CreateMeetingDialog
              classroomId={classroomId}
              meeting={meeting}
              trigger="icon"
            />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {meeting.materials.map((mat) => (
                  <Link
                    key={mat.id}
                    href={`/${type}/kelas/${classroomId}/materi/${mat.id}`}
                    className="p-3 border rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <Book size={20} />
                    <div className="text-sm font-medium truncate">
                      {mat.title}
                    </div>
                  </Link>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {meeting.assignments.map((tgs) => (
                  <Link
                    key={tgs.id}
                    href={`/${type}/kelas/${classroomId}/tugas/${tgs.id}`}
                    className="p-3 border rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <FileText size={20} />
                    <div className="text-sm font-medium truncate">
                      {tgs.title}
                    </div>
                  </Link>
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