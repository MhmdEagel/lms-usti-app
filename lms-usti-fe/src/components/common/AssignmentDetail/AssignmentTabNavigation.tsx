"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, MessageSquare, ClipboardList } from "lucide-react";

export default function AssignmentTabNavigation() {
  const pathname = usePathname();
  const params = useParams();
  const classroomId = params.classroomId as string;
  const assignmentId = params.assignmentId as string;
  const isComments = pathname.includes("/comments");
  const isPenilaian = pathname.includes("/penilaian");

  const segments = pathname.split("/");
  const role = segments[1];

  const tabs: { label: string; icon: typeof FileText; href: string; showFor?: string }[] = [
    {
      label: "Detail",
      icon: FileText,
      href: `/${role}/kelas/${classroomId}/tugas/${assignmentId}`,
    },
    {
      label: "Komentar",
      icon: MessageSquare,
      href: `/${role}/kelas/${classroomId}/tugas/${assignmentId}/comments`,
    },
    {
      label: "Penilaian",
      icon: ClipboardList,
      href: `/${role}/kelas/${classroomId}/tugas/${assignmentId}/penilaian`,
      showFor: "dosen",
    },
  ];

  const filteredTabs = role === "dosen" ? tabs : tabs.filter((t) => !t.showFor || t.showFor === role);

  return (
    <div className="flex border-b border-gray-200 mb-4">
      {filteredTabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-1.5",
            (tab.label === "Detail" && !isComments && !isPenilaian) ||
            (tab.label === "Komentar" && isComments) ||
            (tab.label === "Penilaian" && isPenilaian)
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
