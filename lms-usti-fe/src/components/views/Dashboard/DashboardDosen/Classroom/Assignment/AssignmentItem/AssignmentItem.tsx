"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";
import { FileText, Clock } from "lucide-react";
import type { SubmissionStats } from "@/types/Classroom";

dayjs.extend(utc);
dayjs.extend(timezone);

interface PropTypes {
  assignmentId: string;
  title: string;
  deadline?: string | null;
  type?: "dosen" | "mahasiswa";
  classroomId: string;
  stats?: SubmissionStats | null;
  myStatus?: string;
  myScore?: number | null;
}

export default function AssignmentItem({ assignmentId, title, deadline, type = "dosen", classroomId, stats, myStatus, myScore }: PropTypes) {
  const router = useRouter();
  dayjs.locale("id");
  const hasDeadline = deadline && !deadline.startsWith("0001");
  const isOverdue = hasDeadline && dayjs(deadline).tz("Asia/Jakarta").isBefore(dayjs().tz("Asia/Jakarta"));

  const getBadge = () => {
    if (!myStatus || myStatus === "not_submitted") {
      return { label: "Belum dikerjakan", className: "bg-gray-100 text-gray-700" };
    }
    if (myScore !== null && myScore !== undefined && myScore > 0) {
      return { label: "Sudah dinilai", className: "bg-green-100 text-green-800" };
    }
    return { label: "Belum dinilai", className: "bg-yellow-100 text-yellow-800" };
  };

  const belumDisubmit = stats ? stats.total_students - stats.total_submitted : 0;
  const menungguNilai = stats ? stats.total_submitted - stats.total_graded : 0;
  const sudahDinilai = stats ? stats.total_graded : 0;
  const badge = type === "mahasiswa" ? getBadge() : null;

  return (
    <Card
      className="hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={() =>
        router.push(`/${type}/kelas/${classroomId}/tugas/${assignmentId}`)
      }
    >
      <CardContent className="flex items-center gap-4">
        <div className="p-4 bg-accent rounded-full">
          <FileText />
        </div>
        <div className="space-y-1 flex-1">
          <div className="font-bold text-base md:text-lg">{title}</div>
          {hasDeadline && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${
              isOverdue ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
            }`}>
              <Clock className="h-3 w-3" />
              {dayjs(deadline).format("DD MMMM YYYY, HH:mm")}
            </span>
          )}
          {type === "dosen" && stats && (
            <div className="text-sm text-gray-500">
              Belum disubmit : {belumDisubmit} | Menunggu nilai : {menungguNilai} | Sudah dinilai : {sudahDinilai}
            </div>
          )}
          {badge && (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}