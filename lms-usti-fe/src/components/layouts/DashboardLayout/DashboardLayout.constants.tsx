import { Grid2x2, ListTodo, School, Settings } from "lucide-react";

const SIDEBAR_MAHASISWA = [
  {
    key: "dashboard",
    label: "Dashboard",
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
    label: "Dashboard",
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





export { SIDEBAR_MAHASISWA, SIDEBAR_DOSEN };
