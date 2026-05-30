import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IClassroom } from "@/types/Classroom";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PropTypes {
  classroom: IClassroom;
}

export default function ItemKelas(props: PropTypes) {
  const { classroom } = props;
  return (
    <Link href={`/dosen/kelas/${classroom.id}`}>
      <Card className="pt-3 space-y-8">
        <CardHeader className="px-3">
          <div className="bg-blue-200 h-[150px] rounded-lg">
            <Image
              className="mx-auto block"
              src={"/images/ilustration/classroom/basic.svg"}
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
              <div>{classroom?.dosen.fullname}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
