"use client";

import { usePathname } from "next/navigation";
import ClassroomDetailLayoutNavbarItem from "./ClassroomDetailLayoutNavbarItem";
import { BookOpen, MessageSquare, Settings, Users, ClipboardList } from "lucide-react";

export default function ClassroomDetailLayoutNavbar({
  classroomId,
  type,
  isArchived,
}: {
  classroomId: string;
  type: "dosen" | "mahasiswa";
  isArchived?: boolean;
}) {
  const pathname = usePathname();
  const segment = pathname.split("/")[2] || "kelas";
  const url = `/${pathname.split("/").filter(Boolean).slice(0, 4).join("/")}`;

  return (
    <nav className="flex flex-row gap-2 mb-4 overflow-x-auto">
      <div className="inline-flex justify-start items-center p-0 pb-3 sm:pb-0">
        <div className="w-full border-b-[1.5px] flex flex-row">
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/${segment}/${classroomId}`}
            href={`/${type}/${segment}/${classroomId}`}
          >
            <MessageSquare size={16} />
            <span>Forum Kelas</span>
          </ClassroomDetailLayoutNavbarItem>
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/${segment}/${classroomId}/pertemuan`}
            href={`/${type}/${segment}/${classroomId}/pertemuan`}
          >
            <BookOpen size={16} />
            <span>Perkuliahan</span>
          </ClassroomDetailLayoutNavbarItem>
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/${segment}/${classroomId}/anggota`}
            href={`/${type}/${segment}/${classroomId}/anggota`}
          >
            <Users size={16} />
            <span>Anggota</span>
          </ClassroomDetailLayoutNavbarItem>
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/${segment}/${classroomId}/penilaian`}
            href={`/${type}/${segment}/${classroomId}/penilaian`}
          >
            <ClipboardList size={16} />
            <span>Nilai</span>
          </ClassroomDetailLayoutNavbarItem>
          {type === "dosen" && (
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/${segment}/${classroomId}/pengaturan`}
            href={`/${type}/${segment}/${classroomId}/pengaturan`}
          >
            <Settings size={16} />
            <span>Pengaturan</span>
          </ClassroomDetailLayoutNavbarItem>
          )}
        </div>
      </div> 
    </nav>
  );
}
