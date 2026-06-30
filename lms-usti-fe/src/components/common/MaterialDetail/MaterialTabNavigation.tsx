"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, MessageSquare } from "lucide-react";

export default function MaterialTabNavigation() {
  const pathname = usePathname();
  const params = useParams();
  const classroomId = params.classroomId as string;
  const materiId = params.materiId as string;
  const isComments = pathname.endsWith("/comments");

  const segments = pathname.split("/");
  const role = segments[1];

  const tabs = [
    {
      label: "Materi",
      icon: Book,
      href: `/${role}/kelas/${classroomId}/materi/${materiId}`,
    },
    {
      label: "Komentar",
      icon: MessageSquare,
      href: `/${role}/kelas/${classroomId}/materi/${materiId}/comments`,
    },
  ];

  return (
    <div className="flex border-b border-gray-200 mb-4">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-1.5",
            (!isComments && tab.label === "Materi") ||
            (isComments && tab.label === "Komentar")
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700",
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
