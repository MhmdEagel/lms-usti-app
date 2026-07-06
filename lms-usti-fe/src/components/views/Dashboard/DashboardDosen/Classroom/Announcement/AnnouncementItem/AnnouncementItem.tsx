import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pin, MessageSquare, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
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
  const detailPath = `/${userRole?.toLowerCase() ?? "dosen"}/kelas/${classroomId}/pengumuman/${announcement.id}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
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
        <div className="text-lg font-bold mt-2">{announcement.title}</div>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(announcement.content) }}
        />
        <div className="mt-4">
          <Link href={detailPath} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <MessageSquare className="h-4 w-4" />
            {announcement.comment_count && announcement.comment_count > 0 ? announcement.comment_count : "0"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
