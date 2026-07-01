"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getFileExtension, getFileName, isVideoFile } from "@/lib/utils";
import { IAttachment } from "@/types/Classroom";
import { File, Video } from "lucide-react";

export default function FileMaterialItem({
  fileMateri,
  onClick,
}: {
  fileMateri: IAttachment;
  onClick?: () => void;
}) {
  return (
    <Card
      className="hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4">
        <div className="p-4 bg-accent rounded-full">
          {isVideoFile(fileMateri.name) ? <Video /> : <File />}
        </div>
        <div className="space-y-2">
          <div>
            <div className="font-bold text-gray-500 text-xs md:text-sm">NAMA FILE</div>
            <div className="text-base md:text-lg">{getFileName(fileMateri.name)}</div>
          </div>
          <div>
            <div className="font-bold text-gray-500 text-xs md:text-sm">TIPE</div>
            <div className="text-sm md:text-base">{getFileExtension(fileMateri.url).toUpperCase()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
