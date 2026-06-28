import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pin, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import type { IAnnouncement } from "@/types/Classroom";
import AnnouncementAction from "./AnnouncementAction";

interface PropTypes {
  announcement: IAnnouncement;
  classroomId: string;
  userRole?: string;
}

export default function AnnouncementItem({
  announcement,
  classroomId,
  userRole,
}: PropTypes) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <div className="flex gap-2 items-center">
            <Avatar className="size-10">
              <AvatarFallback>
                <UserIcon />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-primary font-bold">
                {announcement.created_by}
              </div>
              <div className="capitalize">Dosen</div>
            </div>
          </div>
          {announcement.is_pinned && (
            <div className="ml-4 flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              <Pin className="size-3" />
              Pengumuman Dipin
            </div>
          )}
          {userRole === "DOSEN" && (
            <AnnouncementAction
              announcement={announcement}
              classroomId={classroomId}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(announcement.content) }}
        ></div>
      </CardContent>
    </Card>
  );
}
