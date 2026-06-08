"use client";

import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LinkItemProps {
  linkName: string;
  onDelete: () => void;
}

export default function LinkItem({ linkName, onDelete }: LinkItemProps) {
  return (
    <div className="p-4 border rounded-lg flex">
      <div className="flex gap-2 items-center">
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
  );
}
