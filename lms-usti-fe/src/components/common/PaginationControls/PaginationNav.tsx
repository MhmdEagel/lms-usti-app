"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationNavProps {
  current: number;
  totalPages: number;
  total: number;
  limit: number;
}

export default function PaginationNav({
  current,
  totalPages,
  total,
  limit,
}: PaginationNavProps) {
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
      <Button
        variant="outline"
        size="sm"
        disabled={current <= 1}
        onClick={() => navigate(current - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </Button>
      <span className="text-sm text-muted-foreground">
        {current} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={current >= totalPages}
        onClick={() => navigate(current + 1)}
      >
        <span className="hidden sm:inline">Selanjutnya</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <p className="hidden sm:block text-sm text-muted-foreground ml-2">Total: {total}</p>
    </div>
  );
}
