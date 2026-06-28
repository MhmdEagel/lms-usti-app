import { Card, CardContent } from "@/components/ui/card";
import ClassroomHeader from "@/components/layouts/ClassroomDetailLayout/ClassroomHeader/ClassroomHeader";
import Image from "next/image";
import ClassroomDetailLayoutNavbar from "./ClassroomDetailLayoutNavbar/ClassroomDetailLayoutNavbar";
import { IClassroom } from "@/types/Classroom";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <ClassroomBreadcrumb
        type={type}
        classroomName={classroom.class_name}
        classroomId={classroomId}
      />
      <Link href="/dosen/kelas">
        <Button className="rounded-full text-xs sm:text-sm" variant={"ghost"}>
          <ArrowLeft /> Kembali
        </Button>
      </Link>
      <Card className="min-h-[200px] bg-blue-100 relative pt-1 mt-4 overflow-hidden">
        <div className="flex justify-center items-center w-full h-32 sm:h-48 md:h-56 lg:h-64 relative">
          <Image
            className="object-contain"
            src={`/images/ilustration/classroom/${classroom.class_cover}.svg`}
            width={250}
            height={250}
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
        />
      </Card>
      <Card>
        <CardContent>
          <ClassroomDetailLayoutNavbar type={type} classroomId={classroomId} />
          {/* classroom content */}
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
