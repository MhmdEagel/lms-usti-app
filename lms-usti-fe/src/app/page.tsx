"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import authServices from "@/services/auth.service";

export default function HomePage() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const me = await authServices.me();
        const user = me.data.data;
        const rolePaths: Record<string, string> = {
          MAHASISWA: "/mahasiswa",
          DOSEN: "/dosen",
          ADMIN: "/admin",
          PRODI: "/prodi",
        };
        const path = rolePaths[user.role] || "/dosen";
        window.location.href = path;
      } catch {
        window.location.href = "/auth/login";
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-sm">Memuat LMS</p>
    </div>
  );
}
