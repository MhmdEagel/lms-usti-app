"use client";

import CreateClassroom from "@/components/views/Dashboard/DashboardDosen/Classroom/CreateClassroom/CreateClassroom";
import { usePathname } from "next/navigation";

export default function DashboardAction() {
  const url = usePathname();

  return (
    <div className="ml-auto">
      {url === "/dosen/kelas" && <CreateClassroom />}
    </div>
  );
}
