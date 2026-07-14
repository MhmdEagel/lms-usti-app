"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { materialServices } from "@/services/material.service";
import { assignmentServices } from "@/services/assignment.service";
import type { Viewer } from "@/types/Classroom";

interface PropTypes {
  viewableType: "material" | "assignment";
  classroomId: string;
  contentId: string;
  viewCount: number;
  trigger: React.ReactNode;
}

export default function ViewersDialog({
  viewableType,
  classroomId,
  contentId,
  viewCount,
  trigger,
}: PropTypes) {
  const [open, setOpen] = useState(false);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchViewers = useCallback(async () => {
    setLoading(true);
    try {
      const res =
        viewableType === "material"
          ? await materialServices.getViewers(classroomId, contentId)
          : await assignmentServices.getViewers(classroomId, contentId);
      setViewers(res.data?.data || []);
    } catch {
      setViewers([]);
    } finally {
      setLoading(false);
    }
  }, [viewableType, classroomId, contentId]);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      DOSEN: "DOSEN",
      MAHASISWA: "MAHASISWA",
      PRODI: "PRODI",
      ADMIN: "ADMIN",
    };
    return map[role] || role;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) fetchViewers();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Dilihat</DialogTitle>
        </DialogHeader>

        <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto -mx-6 px-6">
          {loading ? (
            <div className="space-y-4 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="size-8 sm:size-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : viewers.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-8">
              Belum ada yang melihat
            </div>
          ) : (
            <div className="divide-y">
              {viewers.map((viewer) => (
                <div
                  key={viewer.id}
                  className="flex items-center gap-3 py-3"
                >
                  <Avatar className="size-8 sm:size-10">
                    <AvatarImage
                      src={viewer.profile || undefined}
                      alt={viewer.fullname}
                    />
                    <AvatarFallback className="text-sm">
                      {getInitial(viewer.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-medium truncate">
                      {viewer.fullname}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {roleLabel(viewer.role)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
