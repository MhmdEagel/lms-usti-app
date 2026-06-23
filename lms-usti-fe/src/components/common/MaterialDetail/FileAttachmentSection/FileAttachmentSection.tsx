"use client";

import { IAttachment } from "@/types/Classroom";
import dynamic from "next/dynamic";
import { useState } from "react";
import FileMaterialItem from "../FileMaterialItem/FileMaterialItem";

const ViewPdf = dynamic(() => import("@/components/common/ViewPdf/ViewPdf"), {
  ssr: false,
});

export default function FileAttachmentSection({
  attachments,
}: {
  attachments: IAttachment[];
}) {
  const [previewFile, setPreviewFile] = useState<IAttachment | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {attachments.map((item) => (
          <FileMaterialItem
            key={item.id}
            fileMateri={item}
            onClick={() => setPreviewFile(item)}
          />
        ))}
      </div>
      {previewFile && (
        <ViewPdf
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
}
