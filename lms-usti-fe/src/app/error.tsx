"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">Terjadi kesalahan</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        {error.message || "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."}
      </p>
      <Button onClick={() => reset()} variant="outline">
        Coba lagi
      </Button>
    </div>
  );
}
