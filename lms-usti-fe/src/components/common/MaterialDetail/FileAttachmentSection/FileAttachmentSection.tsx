"use client";

import { IAttachment } from "@/types/Classroom";
import dynamic from "next/dynamic";
import { useState } from "react";
import FileMaterialItem from "../FileMaterialItem/FileMaterialItem";
import {
  VideoModal,
  VideoModalContent,
  VideoModalTitle,
  VideoModalVideo,
} from "@/components/ui/video-dialog";
import { isVideoFile } from "@/lib/utils";

const ViewPdf = dynamic(() => import("@/components/common/ViewPdf/ViewPdf"), {
  ssr: false,
});

export default function FileAttachmentSection({
  attachments,
}: {
  attachments: IAttachment[];
}) {
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
    isVideo: boolean;
  } | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {attachments.map((item) => (
          <FileMaterialItem
            key={item.id}
            fileMateri={item}
            onClick={() =>
              setPreviewFile({
                url: item.url,
                name: item.name,
                isVideo: isVideoFile(item.name),
              })
            }
          />
        ))}
      </div>
      {previewFile?.isVideo && (
        <VideoModal
          open={true}
          onOpenChange={() => setPreviewFile(null)}
        >
          <VideoModalContent>
            <VideoModalTitle>{previewFile.name}</VideoModalTitle>
            <VideoModalVideo>
              <video
                src={previewFile.url}
                controls
                className="w-full h-full"
              >
                Browser tidak mendukung pemutar video.
              </video>
            </VideoModalVideo>
          </VideoModalContent>
        </VideoModal>
      )}
      {previewFile && !previewFile.isVideo && (
        <ViewPdf
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
}
