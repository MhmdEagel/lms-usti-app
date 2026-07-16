"use client";

import { usePathname } from "next/navigation";
import { BookOpen, Book, ListTodo } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PropTypes {
  classroomId: string;
  type: "dosen" | "mahasiswa";
}

export default function MeetingTabNavigation({ classroomId, type }: PropTypes) {
  const pathname = usePathname();
  const baseUrl = `/${type}/kelas/${classroomId}/pertemuan`;

  const tabs = [
    { label: "Semua Perkuliahan", icon: BookOpen, href: baseUrl },
    { label: "Materi", icon: Book, href: `${baseUrl}/materi` },
    { label: "Tugas", icon: ListTodo, href: `${baseUrl}/tugas` },
  ];

  return (
    <nav className="flex flex-row gap-2 mb-4 mt-2 overflow-x-auto">
      <div className="inline-flex w-full justify-start items-center p-0 min-w-max pb-3 sm:pb-0">
        <div className="w-full border-b-[1.5px] flex flex-row">
          {tabs.map((tab) => {
            const isActive = tab.href === baseUrl
              ? pathname === baseUrl
              : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "p-2 sm:p-3 gap-1 inline-flex items-center justify-center relative h-full whitespace-nowrap min-w-0 text-xs sm:text-sm",
                  isActive && "bg-accent text-primary after:absolute after:bottom-0 after:left-1/4 after:w-1/2 after:h-[2px] after:block after:bg-primary after:content-[''] cursor-pointer"
                )}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
