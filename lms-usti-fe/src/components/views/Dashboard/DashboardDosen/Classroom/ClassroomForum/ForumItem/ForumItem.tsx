"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ContentEditor from "@/components/ui/content-editor";
import { Pin, MessageSquare, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { IAnnouncement as IForumPost } from "@/types/Classroom";
import ForumAction from "./ForumAction";
import { updateAnnouncement } from "@/actions/update-announcement";

interface PropTypes {
  announcement: IForumPost;
  classroomId: string;
  userRole?: string;
}

export default function ForumItem({
  announcement,
  classroomId,
  userRole,
}: PropTypes) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(announcement.title);
  const [editContent, setEditContent] = useState(announcement.content);
  const [isPending, startTransition] = useTransition();

  const detailPath = `/${userRole?.toLowerCase() ?? "dosen"}/kelas/${classroomId}/pengumuman/${announcement.id}`;

  const handleCancel = () => {
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!editTitle.trim()) {
      toast.error("Judul tidak boleh kosong");
      return;
    }
    startTransition(async () => {
      try {
        await updateAnnouncement(classroomId, announcement.id, {
          title: editTitle,
          content: editContent,
        });
        toast.success("Pengumuman berhasil diperbarui");
        setIsEditing(false);
      } catch {
        toast.error("Gagal memperbarui pengumuman");
      }
    });
  };

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
            <ForumAction
              announcement={announcement}
              classroomId={classroomId}
              onEdit={() => setIsEditing(true)}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Judul pengumuman"
            />
            <ContentEditor
              defaultValue={editContent}
              onChange={setEditContent}
              isInvalid={false}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
