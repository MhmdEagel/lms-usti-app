"use client";

import { usePathname } from "next/navigation";
import {
  DASHBOARD_TITLE_DOSEN,
  DASHBOARD_TITLE_MAHASISWA,
  DASHBOARD_TITLE_ADMIN,
  DASHBOARD_TITLE_PRODI,
} from "./DashboardTitle.constant";

export default function DashboardTitle() {
  const pathName = usePathname();
  const url = `/${pathName.split("/").filter(Boolean).slice(0, 2).join("/")}`;
  const dashboard_title = (
    pathName.startsWith("/admin")
      ? DASHBOARD_TITLE_ADMIN
      : pathName.startsWith("/prodi")
        ? DASHBOARD_TITLE_PRODI
        : pathName.startsWith("/dosen")
          ? DASHBOARD_TITLE_DOSEN
          : DASHBOARD_TITLE_MAHASISWA
  ).find((item) => url === item.path);

  return <h1 className="text-base font-medium">{dashboard_title?.title}</h1>;
}
