import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MemberItem({
  fullname,
  profile,
  userId,
  userRole,
}: {
  fullname: string | undefined;
  profile?: string;
  userId: string | undefined;
  userRole: string | undefined;
}) {
  return (
    <div className="flex gap-2 items-center">
      <Avatar className="size-11">
        <AvatarImage src={profile || ""} alt={fullname} />
        <AvatarFallback>
          {fullname?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div>{fullname} {userId && userRole === "MAHASISWA" ? "(Anda)" : null}</div>
    </div>
  );
}
