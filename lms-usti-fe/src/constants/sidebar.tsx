import { SidebarItem } from "@/types/Dashboard";
import { Grid2x2, ListTodo, School, Settings } from "lucide-react";

const SIDEBAR_MAHASISWA: SidebarItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard/mahasiswa",
    icon: <Grid2x2 />,
  },
  {
    key: "kelas",
    label: "Kelas",
    href: "/dashboard/mahasiswa/kelas",
    icon: <School />,
  },
  {
    key: "tugas",
    label: "Tugas",
    href: "/dashboard/mahasiswa/tugas",
    icon: <ListTodo />,
  },
  {
    key: "pengaturan",
    label: "Pengaturan",
    href: "/dashboard/mahasiswa/pengaturan",
    icon: <Settings />,
  },
];

const SIDEBAR_DOSEN = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard/dosen",
    icon: <Grid2x2 />,
  },
  {
    key: "kelas",
    label: "Kelas",
    href: "/dashboard/dosen/kelas",
    icon: <School />,
  },
  {
    key: "pengaturan",
    label: "Pengaturan",
    href: "/dashboard/dosen/pengaturan",
    icon: <Settings />,
  },
];

export { SIDEBAR_MAHASISWA, SIDEBAR_DOSEN };
