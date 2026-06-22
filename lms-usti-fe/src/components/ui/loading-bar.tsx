"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const prevPath = useRef(`${pathname}${searchParams.toString()}`);

  useEffect(() => {
    const currentPath = `${pathname}${searchParams.toString()}`;
    if (currentPath !== prevPath.current) {
      prevPath.current = currentPath;
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  return (
    <div
      className="fixed top-0 left-0 z-[9999] w-full"
      style={{ opacity: isLoading ? 1 : 0, transition: "opacity 0.2s" }}
    >
      <div className="h-[3px] bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/40 animate-pulse" />
      </div>
    </div>
  );
}
