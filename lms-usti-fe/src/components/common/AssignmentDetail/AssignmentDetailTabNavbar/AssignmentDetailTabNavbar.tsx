"use client";

import { usePathname } from "next/navigation";
import AssignmentDetailTabNavbarItem from "./AssignmentDetailTabNavbarItem";
import { FileText, ClipboardList } from "lucide-react";

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

  return (
    <nav className="flex flex-row gap-2 mb-4 overflow-x-auto">
      <div className="inline-flex w-full justify-start items-center p-0 min-w-max pb-3 sm:pb-0">
        <div className="w-full border-b-[1.5px] flex flex-row">
          <AssignmentDetailTabNavbarItem
            isActive={pathname === baseUrl}
            href={baseUrl}
          >
            <FileText size={16} />
            <span>Detail</span>
          </AssignmentDetailTabNavbarItem>
          <AssignmentDetailTabNavbarItem
            isActive={pathname === `${baseUrl}/penilaian`}
            href={`${baseUrl}/penilaian`}
          >
            <ClipboardList size={16} />
            <span>Penilaian</span>
          </AssignmentDetailTabNavbarItem>
        </div>
      </div>
    </nav>
  );
}
