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
      const timer = setTimeout(() => setIsLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  return (
    <div
      className="fixed top-0 left-0 z-[9999] w-full pointer-events-none"
      style={{
        opacity: isLoading ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div className="h-[3px] w-full relative overflow-hidden bg-transparent">
        <div
          className="absolute top-0 left-[-1%] h-full bg-primary rounded-r-full"
          style={{
            animation: isLoading
              ? "loading-bar-progress 1.5s ease-in-out infinite"
              : "none",
          }}
        />
      </div>
    </div>
  );
}
