import { Archive, Grid2x2, School, Settings, Users, ScrollText, MessageSquare, Calendar, MessageCircle } from "lucide-react";

const SIDEBAR_MAHASISWA = [
  {
    key: "dashboard",
    label: "Beranda",
    href: "/mahasiswa",
    icon: <Grid2x2 />,
    group: "UTAMA",
  },
  {
    key: "kelas",
    label: "Kelas",
    href: "/mahasiswa/kelas",
    icon: <School />,
    group: "PEMBELAJARAN",
  },
  {
    key: "arsip",
    label: "Arsip",
    href: "/mahasiswa/arsip",
    icon: <Archive />,
    group: "PEMBELAJARAN",
  },
  {
    key: "percakapan",
    label: "Percakapan",
    href: "/mahasiswa/percakapan",
    icon: <MessageCircle />,
    group: "KOMUNIKASI",
  },
  {
    key: "forum",
    label: "Forum",
    href: "/mahasiswa/forum",
    icon: <MessageSquare />,
    group: "KOMUNIKASI",
  },
  {
    key: "pengaturan",
    label: "Pengaturan",
    href: "/mahasiswa/pengaturan",
    icon: <Settings />,
    group: "SISTEM",
  },
];

const SIDEBAR_DOSEN = [
  {
    key: "dashboard",
    label: "Beranda",
    href: "/dosen",
    icon: <Grid2x2 />,
    group: "UTAMA",
  },
  {
    key: "kelas",
    label: "Kelas",
    href: "/dosen/kelas",
    icon: <School />,
    group: "PEMBELAJARAN",
  },
  {
    key: "arsip",
    label: "Arsip",
    href: "/dosen/arsip",
    icon: <Archive />,
    group: "PEMBELAJARAN",
  },
  {
    key: "percakapan",
    label: "Percakapan",
    href: "/dosen/percakapan",
    icon: <MessageCircle />,
    group: "KOMUNIKASI",
  },
  {
    key: "forum",
    label: "Forum",
    href: "/dosen/forum",
    icon: <MessageSquare />,
    group: "KOMUNIKASI",
  },
  {
    key: "pengaturan",
    label: "Pengaturan",
    href: "/dosen/pengaturan",
    icon: <Settings />,
    group: "SISTEM",
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
    key: "percakapan",
    label: "Percakapan",
    href: "/admin/percakapan",
    icon: <MessageCircle />,
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
  { key: "dashboard",   label: "Beranda",    href: "/prodi",               icon: <Grid2x2 />,       group: "UTAMA" },
  { key: "penjadwalan", label: "Penjadwalan",  href: "/prodi/penjadwalan",   icon: <Calendar />,      group: "UTAMA" },
  { key: "kelas",       label: "Kelas",        href: "/prodi/kelas",         icon: <School />,        group: "PEMBELAJARAN" },
  { key: "arsip",       label: "Arsip",        href: "/prodi/arsip",         icon: <Archive />,       group: "PEMBELAJARAN" },
  { key: "percakapan",  label: "Percakapan",   href: "/prodi/percakapan",    icon: <MessageCircle />, group: "KOMUNIKASI" },
  { key: "forum",       label: "Forum",        href: "/prodi/forum",         icon: <MessageSquare />, group: "KOMUNIKASI" },
  { key: "pengaturan",  label: "Pengaturan",   href: "/prodi/pengaturan",    icon: <Settings />,      group: "SISTEM" },
];

export { SIDEBAR_MAHASISWA, SIDEBAR_DOSEN, SIDEBAR_ADMIN, SIDEBAR_PRODI };
