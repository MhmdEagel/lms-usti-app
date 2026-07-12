"use client";

import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LinkItemProps {
  linkName: string;
  url: string;
  onDelete: () => void;
}

export default function LinkItem({ linkName, onDelete, url }: LinkItemProps) {
  return (
    <Link target="_blank" href={url}>
      <div className="p-3 sm:p-4 border rounded-lg flex">
        <div className="flex gap-2 items-center max-w-[100px] sm:max-w-[150px] min-w-0">
          <div className="rounded-full bg-gray-600 p-1.5 sm:p-2 shrink-0">
            <FileText color="white" className="size-4 sm:size-6" />
          </div>
          <span className="truncate">{linkName}</span>
        </div>
        <Button
          onClick={onDelete}
          type="button"
          variant={"ghost"}
          size="icon"
          className="rounded-full cursor-pointer ml-auto size-7 md:size-8"
        >
          <X />
        </Button>
      </div>
    </Link>
  );
}
