import { Grid2x2, ListTodo, School, Settings, Users, ScrollText, MessageSquare, Calendar } from "lucide-react";

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
  {
    key: "pengaturan",
    label: "Pengaturan",
    href: "/admin/pengaturan",
    icon: <Settings />,
  },
];

const SIDEBAR_PRODI = [
  { key: "dashboard", label: "Dashboard", href: "/prodi", icon: <Grid2x2 /> },
  { key: "forum", label: "Forum", href: "/prodi/forum", icon: <MessageSquare /> },
  { key: "penjadwalan", label: "Penjadwalan", href: "/prodi/penjadwalan", icon: <Calendar /> },
  { key: "pengaturan", label: "Pengaturan", href: "/prodi/pengaturan", icon: <Settings /> },
];

export { SIDEBAR_MAHASISWA, SIDEBAR_DOSEN, SIDEBAR_ADMIN, SIDEBAR_PRODI };
