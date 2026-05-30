import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IClassroom } from "@/types/Classroom";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface PropTypes {
  classroom: IClassroom;
  type: "dosen" | "mahasiswa";
}

export default function ClassroomItem(props: PropTypes) {
  const { classroom, type } = props;
  return (
    <Link
      href={`${type === "dosen" ? "/dosen/kelas/" : "/mahasiswa/kelas/"}${classroom.id}`}
    >
      <Card className="pt-3 space-y-8">
        <CardHeader className="px-3">
          <div className="bg-blue-200 h-[150px] rounded-lg">
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
              <AvatarFallback>
                <UserIcon />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="sm:text-lg font-bold w-[180px]  sm:w-[270px] text-primary truncate">
                {classroom?.class_name}
              </div>
              <div className="w-[180px] sm:w-[270px]">
                {classroom?.dosen.fullname}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
