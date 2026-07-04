"use client";

import { usePathname } from "next/navigation";
import {
  DASHBOARD_TITLE_DOSEN,
  DASHBOARD_TITLE_MAHASISWA,
  DASHBOARD_TITLE_ADMIN,
  DASHBOARD_TITLE_PRODI,
} from "./DashboardTitle.constant";

function matchPath(item: { path: string }, actualPath: string): boolean {
  if (!item.path.includes("[postId]")) {
    return item.path === actualPath;
  }
  const prefix = item.path.split("[postId]")[0];
  return actualPath.startsWith(prefix) && actualPath.split("/").filter(Boolean).length === 3;
}

export default function DashboardTitle() {
  const pathName = usePathname();
  const segments = pathName.split("/").filter(Boolean);
  const url2 = `/${segments.slice(0, 2).join("/")}`;
  const url3 = segments.length >= 3 ? `/${segments.slice(0, 3).join("/")}` : null;

  const allTitles =
    pathName.startsWith("/admin")
      ? DASHBOARD_TITLE_ADMIN
      : pathName.startsWith("/prodi")
        ? DASHBOARD_TITLE_PRODI
        : pathName.startsWith("/dosen")
          ? DASHBOARD_TITLE_DOSEN
          : DASHBOARD_TITLE_MAHASISWA;

  const dashboard_title =
    (url3 && allTitles.find((item) => matchPath(item, url3))) ||
    allTitles.find((item) => item.path === url2);

  return <h1 className="text-base font-medium">{dashboard_title?.title}</h1>;
}
