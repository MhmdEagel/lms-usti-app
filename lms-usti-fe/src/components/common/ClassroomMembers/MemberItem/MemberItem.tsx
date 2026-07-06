import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function MemberItem({
  fullname,
  profile,
  id,
  viewerRole,
  classroomId,
  isCurrentUser,
}: {
  fullname: string | undefined;
  profile?: string;
  id: string | undefined;
  viewerRole: string | undefined; 
  classroomId: string;
  isCurrentUser?: boolean;
}) {
  const href = `/${viewerRole === "DOSEN" ? "dosen" : "mahasiswa"}/kelas/${classroomId}/anggota/${id}`;

  const card = (
    <Card className="py-3 px-4 cursor-pointer hover:bg-primary/10">
      <div className="flex gap-3 items-center">
        <Avatar className="size-11">
          <AvatarImage src={profile || ""} alt={fullname} />
          <AvatarFallback>
            {fullname?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="font-medium">
          {fullname} {isCurrentUser ? "(Anda)" : null}
        </div>
      </div>
    </Card>
  );
  if (isCurrentUser || viewerRole !== "DOSEN") return card;
  return <Link href={href}>{card}</Link>;
}
