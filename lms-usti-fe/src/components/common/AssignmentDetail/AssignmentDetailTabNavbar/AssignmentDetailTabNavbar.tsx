"use client";

import { usePathname } from "next/navigation";
import AssignmentDetailTabNavbarItem from "./AssignmentDetailTabNavbarItem";
import { FileText, ClipboardList, MessageSquare } from "lucide-react";

export default function AssignmentDetailTabNavbar({
  classroomId,
  assignmentId,
  type,
}: {
  classroomId: string;
  assignmentId: string;
  type: "dosen" | "mahasiswa";
}) {
  const pathname = usePathname();
  const baseUrl = `/${type}/kelas/${classroomId}/tugas/${assignmentId}`;

  const tabs: {
    label: string;
    icon: typeof FileText;
    href: string;
    showFor?: string;
  }[] = [
    {
      label: "Detail",
      icon: FileText,
      href: baseUrl,
    },
    {
      label: "Komentar",
      icon: MessageSquare,
      href: `${baseUrl}/comments`,
    },
    {
      label: "Penilaian",
      icon: ClipboardList,
      href: `${baseUrl}/penilaian`,
      showFor: "dosen",
    },
  ];

  const filteredTabs =
    type === "dosen"
      ? tabs
      : tabs.filter((t) => !t.showFor || t.showFor === type);

  return (
    <nav className="flex flex-row gap-2 mb-4 mt-2 overflow-x-auto">
      <div className="inline-flex w-full justify-start items-center p-0 min-w-max pb-3 sm:pb-0">
        <div className="w-full border-b-[1.5px] flex flex-row">
          {filteredTabs.map((tab) => (
            <AssignmentDetailTabNavbarItem
              key={tab.href}
              isActive={pathname === tab.href}
              href={tab.href}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </AssignmentDetailTabNavbarItem>
          ))}
        </div>
      </div>
    </nav>
  );
}
