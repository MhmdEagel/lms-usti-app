"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { StudentGradeAssignment } from "@/types/Classroom";

const statusConfig: Record<string, { label: string; className: string }> = {
  not_submitted: { label: "Belum Dikerjakan", className: "bg-gray-100 text-gray-500" },
  submitted: { label: "Belum Dinilai", className: "bg-yellow-100 text-yellow-700" },
  graded: { label: "Sudah Dinilai", className: "bg-green-100 text-green-700" },
};

export const columns: ColumnDef<StudentGradeAssignment>[] = [
  {
    accessorKey: "title",
    header: "Nama Tugas",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("title")}</span>
    ),
  },
  {
    accessorKey: "score",
    header: "Nilai",
    cell: ({ row }) => {
      const score = row.getValue("score") as number | null;
      return score !== null && score !== undefined ? score : <span className="text-black">-</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = statusConfig[status] || statusConfig.not_submitted;
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
          {config.label}
        </span>
      );
    },
  },
];
