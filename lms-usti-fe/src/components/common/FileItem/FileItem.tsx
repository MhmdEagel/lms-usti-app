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
      toast.success("File berhasil dihapus");
    } catch {
      toast.error("File gagal dihapus");
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg flex ${onClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
      onClick={onClick}
    >
      <div className="flex gap-2 items-center">
        <div className="rounded-full bg-gray-600 p-2">
          <FileText size={"24"} color="white" />
        </div>
        <span className="text-sm max-w-[100px] truncate">{fileName}</span>
      </div>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        type="button"
        variant={"ghost"}
        className="rounded-full cursor-pointer ml-auto"
        disabled={isPending}
      >
        <X />
      </Button>
    </div>
  );
}
