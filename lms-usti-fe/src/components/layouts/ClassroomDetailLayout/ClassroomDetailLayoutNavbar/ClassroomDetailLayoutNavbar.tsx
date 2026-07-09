"use client";

import { usePathname } from "next/navigation";
import ClassroomDetailLayoutNavbarItem from "./ClassroomDetailLayoutNavbarItem";
import { Book, ListTodo, MessageSquare, Settings, Users } from "lucide-react";

export default function ClassroomDetailLayoutNavbar({
  classroomId,
  type,
}: {
  classroomId: string;
  type: "dosen" | "mahasiswa";
}) {
  const pathname = usePathname();
  const url = `/${pathname.split("/").filter(Boolean).slice(0, 4).join("/")}`;

  return (
    <nav className="flex flex-row gap-2 mb-4 overflow-x-auto">
      <div className="inline-flex w-full justify-start items-center p-0 min-w-max pb-3 sm:pb-0">
        <div className="w-full border-b-[1.5px] flex flex-row">
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/kelas/${classroomId}`}
            href={`/${type}/kelas/${classroomId}`}
          >
            <MessageSquare size={16} />
            <span>Forum Kelas</span>
          </ClassroomDetailLayoutNavbarItem>
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/kelas/${classroomId}/materi`}
            href={`/${type}/kelas/${classroomId}/materi`}
          >
            <Book size={16} />
            <span>Materi</span>
          </ClassroomDetailLayoutNavbarItem>
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/kelas/${classroomId}/tugas`}
            href={`/${type}/kelas/${classroomId}/tugas`}
          >
            <ListTodo size={16} />
            <span>Tugas</span>
          </ClassroomDetailLayoutNavbarItem>
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/kelas/${classroomId}/anggota`}
            href={`/${type}/kelas/${classroomId}/anggota`}
          >
            <Users size={16} />
            <span>Anggota</span>
          </ClassroomDetailLayoutNavbarItem>
          {type === "dosen" && (
          <ClassroomDetailLayoutNavbarItem
            isActive={url === `/${type}/kelas/${classroomId}/pengaturan`}
            href={`/${type}/kelas/${classroomId}/pengaturan`}
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
