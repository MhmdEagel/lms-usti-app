import { Grid2x2, ListTodo, School, Settings, Users, ScrollText } from "lucide-react";

const SIDEBAR_MAHASISWA = [
  {
    key: "dashboard",
    label: "Beranda",
    href: "/mahasiswa",
    icon: <Grid2x2 />,
  },
  {
    key: "kelas",
    label: "Kelas",
    href: "/mahasiswa/kelas",
    icon: <School />,
  },
  {
    key: "tugas",
    label: "Tugas",
    href: "/mahasiswa/tugas",
    icon: <ListTodo />,
  },
  {
    key: "pengaturan",
    label: "Pengaturan",
    href: "/mahasiswa/pengaturan",
    icon: <Settings />,
  },
];

const SIDEBAR_DOSEN = [
  {
    key: "dashboard",
    label: "Beranda",
    href: "/dosen",
    icon: <Grid2x2 />,
  },
  {
    key: "kelas",
    label: "Kelas",
    href: "/dosen/kelas",
    icon: <School />,
  },
  {
    key: "pengaturan",
    label: "Pengaturan",
    href: "/dosen/pengaturan",
    icon: <Settings />,
  },
];

const SIDEBAR_ADMIN = [
  {
    key: "users",
    label: "Manajemen User",
    href: "/admin/users",
    icon: <Users />,
  },
  {
    key: "audit",
    label: "Audit Logs",
    href: "/admin/audit",
    icon: <ScrollText />,
  },
];

export { SIDEBAR_MAHASISWA, SIDEBAR_DOSEN, SIDEBAR_ADMIN };
