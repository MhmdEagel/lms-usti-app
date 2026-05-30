"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BackBtn() {
  const router = useRouter();
  return <Button onClick={() => router.back()}>Kembali</Button>;
}
