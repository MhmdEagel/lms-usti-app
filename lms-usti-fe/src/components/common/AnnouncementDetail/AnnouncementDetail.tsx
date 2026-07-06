"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pin, UserIcon } from "lucide-react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import AnnouncementCommentSection from "./AnnouncementCommentSection/AnnouncementCommentSection";
import type { IAnnouncement, IComment, IClassroomPolicies } from "@/types/Classroom";

interface PropTypes {
  classroomId: string;
  announcement: IAnnouncement;
  comments: IComment[];
  currentId: string;
  currentRole: string;
  policies: IClassroomPolicies | null;
}

export default function AnnouncementDetail({
  classroomId,
  announcement,
  comments,
  currentId,
  currentRole,
  policies,
}: PropTypes) {
  return (
    <div className="p-4">
      <Link
        className="mb-2 inline-block"
        href={`/${currentRole.toLowerCase()}/kelas/${classroomId}`}
      >
        <Button className="rounded-full" variant="ghost">
          <ArrowLeft /> Kembali ke kelas
        </Button>
      </Link>

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
                <div className="capitalize text-sm text-gray-500">Dosen</div>
              </div>
            </div>
            {announcement.is_pinned && (
              <div className="ml-4 flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                <Pin className="size-3" />
                Pengumuman Dipin
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-lg mb-2">{announcement.title}</div>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(announcement.content),
            }}
          />
        </CardContent>
      </Card>

      <AnnouncementCommentSection
        classroomId={classroomId}
        announcementId={announcement.id}
        initialComments={comments}
        currentId={currentId}
        currentRole={currentRole}
        commentPermission={policies?.comment_permission ?? "active"}
      />
    </div>
  );
}
