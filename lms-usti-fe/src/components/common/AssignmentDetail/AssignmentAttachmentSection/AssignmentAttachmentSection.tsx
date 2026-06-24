"use client";

import type { IAttachment } from "@/types/Classroom";
import FileAttachmentSection from "../../MaterialDetail/FileAttachmentSection/FileAttachmentSection";
import LinkMaterialItem from "../../MaterialDetail/LinkMaterialItem/LinkMaterialItem";

interface PropTypes {
  attachments: IAttachment[];
}

export default function AssignmentAttachmentSection({ attachments }: PropTypes) {
  const fileAttachments = attachments.filter((a) => a.type === "FILE" || a.type === "VIDEO");
  const linkAttachments = attachments.filter((a) => a.type === "LINK");

  return (
    <>
      {fileAttachments.length > 0 && (
        <div>
          <FileAttachmentSection attachments={fileAttachments} />
        </div>
      )}
      {linkAttachments.length > 0 && (
        <div>
          <div className="font-bold text-gray-500 text-sm mb-4">LINK</div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {linkAttachments.map((item) => (
              <LinkMaterialItem key={item.id} linkMateri={item} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
