"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  current: number;
  totalPages: number;
  total: number;
  limit: number;
}

const limitOptions = [5, 10, 20, 50];

export default function PaginationControls({
  current,
  totalPages,
  total,
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
    <div className="flex items-center justify-between mt-4">
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
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={current <= 1}
          onClick={() => navigate(current - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>
        <span className="text-sm text-muted-foreground">
          {current} dari {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={current >= totalPages}
          onClick={() => navigate(current + 1)}
        >
          Selanjutnya
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Total: {total}</p>
    </div>
  );
}
