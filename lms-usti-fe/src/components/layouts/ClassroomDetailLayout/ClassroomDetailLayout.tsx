import { Card, CardContent } from "@/components/ui/card";
import ClassroomHeader from "@/components/layouts/ClassroomDetailLayout/ClassroomHeader/ClassroomHeader";
import Image from "next/image";
import ClassroomDetailLayoutNavbar from "./ClassroomDetailLayoutNavbar/ClassroomDetailLayoutNavbar";
import { IClassroom } from "@/types/Classroom";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassroomBreadcrumb } from "./ClassroomBreadcrumb";

export default function ClassroomDetailLayout({
  children,
  classroom,
  classroomId,
  type,
}: {
  children: React.ReactNode;
  classroom: IClassroom;
  classroomId: string;
  type: "dosen" | "mahasiswa";
}) {
  return (
    <div className="space-y-2 p-2 sm:p-4">
      {classroom.is_archived && type === "mahasiswa" && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <AlertTriangle className="size-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Kelas telah diarsipkan oleh dosen Anda. Anda tidak dapat menambahkan
            atau mengedit apapun.
          </p>
        </div>
      )}
      {classroom.is_archived && type === "dosen" && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <AlertTriangle className="size-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Kelas telah diarsipkan. Anda dapat mengeluarkannya dari arsip
            dengan membuka pengaturan.
          </p>
        </div>
      )}
      <ClassroomBreadcrumb
        type={type}
        classroomName={classroom.class_name}
        classroomId={classroomId}
      />
      <Link href={`/${type}/${classroom.is_archived ? "arsip" : "kelas"}`}>
        <Button className="rounded-full text-xs sm:text-sm" variant={"ghost"}>
          <ArrowLeft /> Kembali
        </Button>
      </Link>
      <Card className={`min-h-[200px] bg-blue-100 relative pt-1 mt-4 overflow-hidden pb-20 sm:pb-24 flex flex-col ${classroom.is_archived ? "opacity-60" : ""}`}>
        <div className="flex-1 min-h-0 flex justify-center items-center w-full relative">
          <Image
            className="object-contain max-w-[50%] sm:max-w-[60%] md:max-w-full"
            src={`/images/ilustration/classroom/${classroom.class_cover}.svg`}
            width={220}
            height={220}
            alt="Classroom Cover"
          />
        </div>
        <ClassroomHeader
          type={type}
          class_code={classroom.class_code}
          class_name={classroom.class_name}
          day={classroom.day}
          dosen={classroom.dosen}
          prodi={classroom.prodi}
          room_number={classroom.room_number}
          class_start={classroom.class_start}
          class_end={classroom.class_end}
          term={classroom.term}
          isArchived={classroom.is_archived}
        />
      </Card>
      <Card>
        <CardContent>
          <ClassroomDetailLayoutNavbar
            type={type}
            classroomId={classroomId}
            isArchived={classroom.is_archived}
          />
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
