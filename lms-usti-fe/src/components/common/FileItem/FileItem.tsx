"use client";

import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileItemProps {
  fileName: string;
  onDelete: () => Promise<void>;
  isPending?: boolean;
  fileUrl?: string;
  onClick?: () => void;
}

export default function FileItem({
  fileName,
  onDelete,
  isPending = false,
  onClick,
}: FileItemProps) {
  const handleDelete = async () => {
    try {
      await onDelete();
    } catch {
      toast.error("File gagal dihapus");
    }
  };

  return (
    <div
      className={`p-3 sm:p-4 border rounded-lg flex ${onClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
      onClick={onClick}
    >
      <div className="flex gap-2 items-center min-w-0">
        <div className="rounded-full bg-gray-600 p-1.5 sm:p-2 shrink-0">
          <FileText color="white" className="size-4 sm:size-6" />
        </div>
        <span className="text-sm max-w-[100px] sm:max-w-[150px] truncate">{fileName}</span>
      </div>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        type="button"
        variant={"ghost"}
        size="icon"
        className="rounded-full cursor-pointer ml-auto size-7 md:size-8"
        disabled={isPending}
      >
        <X />
      </Button>
    </div>
  );
}
