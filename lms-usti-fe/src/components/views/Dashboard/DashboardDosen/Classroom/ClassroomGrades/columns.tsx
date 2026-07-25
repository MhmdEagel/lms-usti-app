"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ClassroomGradeAssignment, ClassroomGradeStudent } from "@/types/Classroom";

export function generateColumns(
  assignments: ClassroomGradeAssignment[],
  averages: Record<string, number>,
  overallAverage: number
): ColumnDef<ClassroomGradeStudent>[] {
  const cols: ColumnDef<ClassroomGradeStudent>[] = [];

  cols.push({
    id: "fullname",
    accessorKey: "fullname",
    header: "Nama Mahasiswa",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("fullname")}</span>
    ),
    footer: () => <span className="font-semibold">Rata-rata Kelas</span>,
    meta: {
      sticky: true,
      headerClassName: "bg-blue-100 text-black font-medium min-w-[200px]",
      cellClassName: "bg-white font-medium",
      footerClassName: "bg-blue-100 font-semibold",
    },
  });

  for (const a of assignments) {
    cols.push({
      id: a.id,
      accessorFn: (row) => row.grades[a.id],
      header: a.title,
      cell: ({ row }) => {
        const value = row.getValue<number | null>(a.id);
        return value !== null && value !== undefined ? (
          value
        ) : (
          <span className="text-black">-</span>
        );
      },
      footer: () => {
        const avg = averages[a.id];
        return avg !== undefined && avg !== null
          ? Math.round(avg * 10) / 10
          : "-";
      },
      meta: {
        headerClassName: "bg-blue-100 text-black font-medium min-w-[120px]",
      },
    });
  }

  cols.push({
    id: "_average",
    accessorFn: (row) => {
      const scores = Object.values(row.grades).filter(
        (s): s is number => s !== null && s !== undefined
      );
      return scores.length > 0
        ? Math.round(
            (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
          ) / 10
        : null;
    },
    header: "Rata-rata",
    cell: ({ row }) => {
      const value = row.getValue<number | null>("_average");
      return value !== null && value !== undefined ? (
        <span className="font-semibold">{value}</span>
      ) : (
        <span className="text-black">-</span>
      );
    },
    footer: () =>
      overallAverage !== null && overallAverage !== undefined
        ? Math.round(overallAverage * 10) / 10
        : "-",
    meta: {
      headerClassName: "bg-blue-100 text-black font-medium min-w-[120px]",
    },
  });

  return cols;
}
