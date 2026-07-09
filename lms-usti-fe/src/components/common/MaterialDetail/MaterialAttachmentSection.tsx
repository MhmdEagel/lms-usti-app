"use client";

import { useMemo, useState } from "react";
import { IAttachment } from "@/types/Classroom";
import { AttachmentCategory, getAttachmentCategory } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FileAttachmentSection from "./FileAttachmentSection/FileAttachmentSection";
import LinkMaterialItem from "./LinkMaterialItem";

interface ChipDef {
  key: "all" | AttachmentCategory;
  label: string;
  count: number;
}

export default function MaterialAttachmentSection({
  attachments,
}: {
  attachments: IAttachment[];
}) {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | AttachmentCategory
  >("all");

  const chips: ChipDef[] = useMemo(() => {
    const counts: Record<string, number> = {};
    attachments.forEach((att) => {
      const cat = getAttachmentCategory(att);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return [
      { key: "all", label: "Semua", count: attachments.length },
      { key: "pdf", label: "PDF", count: counts["pdf"] || 0 },
      { key: "word", label: "Word", count: counts["word"] || 0 },
      {
        key: "presentation",
        label: "Presentasi",
        count: counts["presentation"] || 0,
      },
      { key: "video", label: "Video", count: counts["video"] || 0 },
      { key: "link", label: "Link", count: counts["link"] || 0 },
    ];
  }, [attachments]);

  const filteredAttachments = useMemo(() => {
    if (selectedFilter === "all") return attachments;
    return attachments.filter((att) => {
      const category = getAttachmentCategory(att);
      return category === selectedFilter;
    });
  }, [attachments, selectedFilter]);

  const fileAttachments = useMemo(
    () => filteredAttachments.filter((a) => a.type === "FILE"),
    [filteredAttachments],
  );

  const linkAttachments = useMemo(
    () => filteredAttachments.filter((a) => a.type === "LINK"),
    [filteredAttachments],
  );

  function handleChipClick(key: "all" | AttachmentCategory) {
    setSelectedFilter((prev) => (prev === key ? "all" : key));
  }

  if (attachments.length === 0) {
    return (
      <div className="h-23 flex items-center justify-center">
        Tidak ada lampiran
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((chip) => (
          <Button
            key={chip.key}
            variant={selectedFilter === chip.key ? "default" : "outline"}
            size="sm"
            onClick={() => handleChipClick(chip.key)}
          >
            {chip.label}
            {chip.count > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary-foreground/20 px-1.5 text-xs font-semibold tabular-nums">
                {chip.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {filteredAttachments.length === 0 ? (
        <div className="h-23 flex items-center justify-center">
          Tidak ada lampiran
        </div>
      ) : (
        <>
          {fileAttachments.length > 0 && (
            <FileAttachmentSection attachments={fileAttachments} />
          )}
          {linkAttachments.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              {linkAttachments.map((item) => (
                <LinkMaterialItem key={item.id} linkMateri={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
