"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationControlsProps {
  current: number;
  limit: number;
}

const limitOptions = [5, 10, 20, 50];

export default function PaginationControls({
  current,
  limit,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (page: number, newLimit?: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    params.set("limit", String(newLimit ?? limit));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Baris per halaman</span>
      <Select
        value={String(limit)}
        onValueChange={(v) => navigate(1, Number(v))}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {limitOptions.map((opt) => (
            <SelectItem key={opt} value={String(opt)}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
