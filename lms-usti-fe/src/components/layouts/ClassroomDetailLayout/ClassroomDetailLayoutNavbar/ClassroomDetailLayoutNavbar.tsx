"use client";

import { usePathname } from "next/navigation";
import ClassroomDetailLayoutNavbarItem from "./ClassroomDetailLayoutNavbarItem";
import { Book, ListTodo, MessageSquare, Settings, Users } from "lucide-react";

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
            isActive={url === `/${type}/${segment}/${classroomId}/materi`}
            href={`/${type}/${segment}/${classroomId}/materi`}
          >
            <Book size={16} />
            <span>Materi</span>
          </ClassroomDetailLayoutNavbarItem>
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/${segment}/${classroomId}/tugas`}
            href={`/${type}/${segment}/${classroomId}/tugas`}
          >
            <ListTodo size={16} />
            <span>Tugas</span>
          </ClassroomDetailLayoutNavbarItem>
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/${segment}/${classroomId}/anggota`}
            href={`/${type}/${segment}/${classroomId}/anggota`}
          >
            <Users size={16} />
            <span>Anggota</span>
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
