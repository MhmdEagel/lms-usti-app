"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";
import { FileText } from "lucide-react";

dayjs.extend(utc);
dayjs.extend(timezone);

interface PropTypes {
  assignmentId: string;
  title: string;
  deadline?: string | null;
  type?: "dosen" | "mahasiswa";
  classroomId: string;
}

export default function AssignmentItem({ assignmentId, title, deadline, type = "dosen", classroomId }: PropTypes) {
  const router = useRouter();
  dayjs.locale("id");
  const hasDeadline = deadline && !deadline.startsWith("0001");
  const isOverdue = hasDeadline && dayjs(deadline).tz("Asia/Jakarta").isBefore(dayjs().tz("Asia/Jakarta"));

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
            <div className={`text-sm ${isOverdue ? "text-red-500" : "text-gray-500"}`}>
              Batas pengumpulan: {dayjs(deadline).format("DD MMMM YYYY, HH:mm")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}