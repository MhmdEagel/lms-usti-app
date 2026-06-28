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
      <div className="p-4 border rounded-lg flex">
        <div className="flex gap-2 items-center truncate max-w-[100]">
          <div className="rounded-full bg-gray-600 p-2">
            <FileText size={"24"} color="white" />
          </div>
          {linkName}
        </div>
        <Button
          onClick={onDelete}
          type="button"
          variant={"ghost"}
          className="rounded-full cursor-pointer ml-auto "
        >
          <X />
        </Button>
      </div>
    </Link>
  );
}
