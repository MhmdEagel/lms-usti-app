import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IClassroom } from "@/types/Classroom";
import Image from "next/image";
import Link from "next/link";

interface PropTypes {
  classroom: IClassroom;
  type: "dosen" | "mahasiswa" | "prodi";
  isArchived?: boolean;
  view?: "grid" | "list";
}

function CompactCard({ classroom, isArchived }: { classroom: IClassroom; isArchived?: boolean }) {
  const totalStudents = classroom.total_students ?? 0;

  return (
    <Card className={isArchived ? "opacity-60" : ""}>
      <CardContent className="pt-6 flex items-center gap-4">
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={classroom?.dosen.profile || ""} alt={classroom?.dosen.fullname} />
          <AvatarFallback>
            {classroom?.dosen.fullname?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="sm:text-lg font-bold text-primary truncate">
            {classroom?.class_name}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {classroom?.dosen.fullname}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">
            {totalStudents} Mahasiswa
          </span>
          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">
            {classroom?.prodi}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function ProdiClassroomCard({ classroom, isArchived }: { classroom: IClassroom; isArchived?: boolean }) {
  const totalStudents = classroom.total_students ?? 0;
  const meetingProgress = classroom.meeting_progress;
  const progressValue = meetingProgress && meetingProgress.total > 0
    ? Math.round((meetingProgress.current / meetingProgress.total) * 100)
    : 0;

  return (
    <Card className={isArchived ? "opacity-60" : ""}>
      <CardContent className="pt-6 space-y-3">
        <div className="flex gap-3 items-start">
          <Avatar className="size-12 shrink-0">
            <AvatarImage src={classroom?.dosen.profile || ""} alt={classroom?.dosen.fullname} />
            <AvatarFallback>
              {classroom?.dosen.fullname?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="sm:text-lg font-bold text-primary truncate">
              {classroom?.class_name}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {classroom?.dosen.fullname}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">
            {totalStudents} Mahasiswa
          </span>
          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">
            {classroom?.prodi}
          </span>
        </div>

        {meetingProgress && meetingProgress.total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pertemuan</span>
              <span>{meetingProgress.current}/{meetingProgress.total}</span>
            </div>
            <Progress value={progressValue} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DefaultClassroomCard({ classroom, isArchived }: { classroom: IClassroom; isArchived?: boolean }) {
  return (
    <Card className="pt-3 space-y-8">
      <CardHeader className="px-3">
        <div className={`bg-blue-200 h-[150px] rounded-lg ${isArchived ? "opacity-60" : ""}`}>
          <Image
            className="mx-auto block"
            src={`/images/ilustration/classroom/${classroom.class_cover}.svg`}
            width={190}
            height={190}
            alt="Classroom Cover"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center">
          <Avatar className="size-12">
            <AvatarImage src={classroom?.dosen.profile || ""} alt={classroom?.dosen.fullname} />
            <AvatarFallback>
              {classroom?.dosen.fullname?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="sm:text-lg font-bold w-full text-primary truncate">
              {classroom?.class_name}
            </div>
            <div className="w-full truncate">
              {classroom?.dosen.fullname}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClassroomItem(props: PropTypes) {
  const { classroom, type, isArchived, view } = props;
  const prefix = isArchived ? "arsip" : "kelas";

  return (
    <Link href={`/${type}/${prefix}/${classroom.id}`}>
      {view === "list" ? (
        <CompactCard classroom={classroom} isArchived={isArchived} />
      ) : type === "prodi" ? (
        <ProdiClassroomCard classroom={classroom} isArchived={isArchived} />
      ) : (
        <DefaultClassroomCard classroom={classroom} isArchived={isArchived} />
      )}
    </Link>
  );
}
