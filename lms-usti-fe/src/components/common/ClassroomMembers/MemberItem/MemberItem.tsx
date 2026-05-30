import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

export default function MemberItem({
  fullname,
  userId,
  userRole,
}: {
  fullname: string | undefined;
  userId: string | undefined;
  userRole: string | undefined;
}) {
  return (
    <div className="flex gap-2 items-center">
      <Avatar className="size-11">
        <AvatarFallback>
          <User />
        </AvatarFallback>
      </Avatar>
      <div>{fullname} {userId && userRole === "MAHASISWA" ? "(Anda)" : null}</div>
    </div>
  );
}
