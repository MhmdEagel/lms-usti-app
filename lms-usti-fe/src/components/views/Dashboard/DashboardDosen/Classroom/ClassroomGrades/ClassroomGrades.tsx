"use client";

import { useMemo } from "react";
import type { ClassroomGradesResponse } from "@/types/Classroom";
import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToGradesExcel } from "./exportToGradesExcel";

interface PropTypes {
  data: ClassroomGradesResponse;
  classroomName?: string;
}

export default function ClassroomGrades({ data, classroomName }: PropTypes) {
  const hasAssignments = data.assignments.length > 0;

  const columns = useMemo(() => {
    const cols: { key: string; label: string; fixed?: boolean }[] = [];
    if (!hasAssignments) {
      cols.push({ key: "fullname", label: "Nama Mahasiswa", fixed: true });
      return cols;
    }
    cols.push({ key: "fullname", label: "Nama Mahasiswa", fixed: true });
    for (const a of data.assignments) {
      cols.push({ key: a.id, label: a.title });
    }
    cols.push({ key: "_average", label: "Rata-rata" });
    return cols;
  }, [data.assignments, hasAssignments]);

  const rows = useMemo(() => {
    if (!hasAssignments) return [];
    return data.students.map((student) => {
      const row: Record<string, string | number | null> = { fullname: student.fullname };
      let sum = 0;
      let count = 0;
      for (const a of data.assignments) {
        const score = student.grades[a.id];
        row[a.id] = score ?? null;
        if (score !== null && score !== undefined) {
          sum += score;
          count++;
        }
      }
      row["_average"] = count > 0 ? Math.round((sum / count) * 10) / 10 : null;
      return row;
    });
  }, [data, hasAssignments]);

  const averageRow = useMemo(() => {
    if (!hasAssignments) return null;
    const row: Record<string, string | number | null> = { fullname: "Rata-rata Kelas" };
    for (const a of data.assignments) {
      const avg = data.averages[a.id];
      row[a.id] = avg !== undefined && avg !== null ? Math.round(avg * 10) / 10 : null;
    }
    row["_average"] =
      data.overall_average !== null && data.overall_average !== undefined
        ? Math.round(data.overall_average * 10) / 10
        : null;
    return row;
  }, [data, hasAssignments]);

  if (!hasAssignments) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-black">
        <Book className="size-12" />
        <p className="text-lg font-medium">Belum ada tugas yang dibuat</p>
        <p className="text-sm">Nilai akan muncul setelah Anda membuat tugas di kelas ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="pb-4 border-b-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Daftar Nilai</h2>
        </div>
        <Button
          onClick={() => exportToGradesExcel(data, classroomName)}
          variant="default"
        >
          Unduh Excel
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium text-black whitespace-nowrap ${
                    col.fixed
                      ? "sticky left-0 z-10 min-w-[200px] bg-blue-100"
                      : "min-w-[120px]"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 whitespace-nowrap ${
                      col.fixed ? "sticky left-0 z-10 font-medium bg-white" : ""
                    }`}
                  >
                    {col.key === "fullname" ? (
                      row[col.key]
                    ) : col.key === "_average" ? (
                      row[col.key] !== null && row[col.key] !== undefined ? (
                        <span className="font-semibold">{row[col.key]}</span>
                      ) : (
                        <span className="text-black">-</span>
                      )
                    ) : row[col.key] !== null && row[col.key] !== undefined ? (
                      row[col.key]
                    ) : (
                        <span className="text-black">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            {averageRow && (
              <tr className="border-t bg-blue-100 font-semibold">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 whitespace-nowrap ${
                      col.fixed ? "sticky left-0 z-10 bg-blue-100" : ""
                    }`}
                  >
                    {col.key === "fullname"
                      ? averageRow[col.key]
                      : col.key === "_average"
                      ? averageRow[col.key] !== null && averageRow[col.key] !== undefined
                        ? averageRow[col.key]
                        : "-"
                      : averageRow[col.key] !== null && averageRow[col.key] !== undefined
                      ? averageRow[col.key]
                      : "-"}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-black">
        Rata-rata Keseluruhan:{" "}
        <span className="font-bold text-primary">
          {data.overall_average !== null && data.overall_average !== undefined
            ? Math.round(data.overall_average * 10) / 10
            : "-"}
        </span>
      </div>
    </div>
  );
}
