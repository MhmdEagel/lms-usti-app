"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton() {
  return (
    <Button
      className="rounded-full"
      variant="ghost"
      type="button"
      onClick={() => window.history.back()}
    >
      <ArrowLeft /> Kembali
    </Button>
  );
}