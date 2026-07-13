import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IClassroom } from "@/types/Classroom";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface PropTypes {
  classroom: IClassroom;
  type: "dosen" | "mahasiswa";
  isArchived?: boolean;
}

export default function ClassroomItem(props: PropTypes) {
  const { classroom, type, isArchived } = props;
  const prefix = isArchived ? "arsip" : "kelas";
  return (
    <Link
      href={`/${type}/${prefix}/${classroom.id}`}
    >
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
    </Link>
  );
}
