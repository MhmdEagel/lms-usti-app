"use client";

import { useMemo } from "react";
import type { ClassroomGradesResponse } from "@/types/Classroom";
import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { exportToGradesExcel } from "./exportToGradesExcel";
import { generateColumns } from "./columns";

interface PropTypes {
  data: ClassroomGradesResponse;
  classroomName?: string;
}

export default function ClassroomGrades({ data, classroomName }: PropTypes) {
  const hasAssignments = data.assignments.length > 0;

  const columns = useMemo(
    () =>
      generateColumns(data.assignments, data.averages, data.overall_average),
    [data],
  );

  if (!hasAssignments) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-black">
        <Book className="size-12" />
        <p className="text-lg font-medium">Belum ada tugas yang dibuat</p>
        <p className="text-sm">
          Nilai akan muncul setelah Anda membuat tugas di kelas ini.
        </p>
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
      <div className="w-full max-w-4xl">
        <DataTable columns={columns} data={data.students} />
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
