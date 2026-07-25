const PRODI_COLORS: Record<
  string,
  { bg: string; borderLeft: string; border: string; hover: string; text: string }
> = {
  "Teknik Informatika": {
    bg: "bg-blue-100",
    borderLeft: "border-l-blue-500",
    border: "border-blue-200",
    hover: "hover:bg-blue-200",
    text: "text-gray-700",
  },
  "Sistem Informasi": {
    bg: "bg-green-100",
    borderLeft: "border-l-green-500",
    border: "border-green-200",
    hover: "hover:bg-green-200",
    text: "text-gray-700",
  },
  "Teknologi Informasi": {
    bg: "bg-orange-100",
    borderLeft: "border-l-orange-500",
    border: "border-orange-200",
    hover: "hover:bg-orange-200",
    text: "text-gray-700",
  },
  "Informatika Medis": {
    bg: "bg-pink-100",
    borderLeft: "border-l-pink-500",
    border: "border-pink-200",
    hover: "hover:bg-pink-200",
    text: "text-gray-700",
  },
  "Manajemen Bisnis Internasional": {
    bg: "bg-rose-100",
    borderLeft: "border-l-rose-500",
    border: "border-rose-200",
    hover: "hover:bg-rose-200",
    text: "text-gray-700",
  },
  "Hukum Bisnis": {
    bg: "bg-purple-100",
    borderLeft: "border-l-purple-500",
    border: "border-purple-200",
    hover: "hover:bg-purple-200",
    text: "text-gray-700",
  },
  "Teknik Logistik": {
    bg: "bg-yellow-100",
    borderLeft: "border-l-yellow-500",
    border: "border-yellow-200",
    hover: "hover:bg-yellow-200",
    text: "text-gray-700",
  },
  "Pendidikan Teknologi Informasi": {
    bg: "bg-teal-100",
    borderLeft: "border-l-teal-500",
    border: "border-teal-200",
    hover: "hover:bg-teal-200",
    text: "text-gray-700",
  },
};

export const DEFAULT_PRODI_COLOR = {
  bg: "bg-primary/10",
  borderLeft: "border-l-primary",
  border: "border-primary/20",
  hover: "hover:bg-primary/20",
  text: "text-foreground",
};

export default PRODI_COLORS;
