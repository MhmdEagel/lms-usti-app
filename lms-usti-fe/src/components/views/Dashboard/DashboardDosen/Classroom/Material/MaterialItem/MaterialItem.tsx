import { Card, CardHeader } from "@/components/ui/card";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/id";
import Link from "next/link";
import { Book } from "lucide-react";

export default function MaterialItem({
  materialId,
  title,
  createdAt,
  type,
  classroomId,
  compact,
}: {
  materialId: string;
  title: string;
  createdAt: string;
  type: string;
  classroomId: string;
  compact?: boolean;
}) {
  dayjs.extend(localizedFormat);
  dayjs.locale("id");

  if (compact) {
    return (
      <Link href={`/${type}/kelas/${classroomId}/materi/${materialId}`}>
        <Card className="cursor-pointer py-3 hover:bg-accent/50">
          <CardHeader className="flex gap-2 items-center">
            <div className="rounded-full bg-accent p-2">
              <Book className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{title}</div>
              <div className="text-xs text-muted-foreground">
                {dayjs(createdAt).format("lll")}
              </div>
            </div>
          </CardHeader>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/${type}/kelas/${classroomId}/materi/${materialId}`}>
      <Card className="py-4 cursor-pointer">
        <CardHeader className="flex gap-4 items-center">
          <div className="rounded-full bg-accent p-4">
            <Book className="size-4 sm:size-8" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold">{title}</div>
            <div className="text-xs sm:text-sm">
              {dayjs(createdAt).format("lll")}
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
