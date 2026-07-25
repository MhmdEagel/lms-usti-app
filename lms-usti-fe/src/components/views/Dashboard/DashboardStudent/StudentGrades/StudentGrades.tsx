"use client";

import { useCallback } from "react";
import type { StudentGradeAssignment, StudentGradesResponse } from "@/types/Classroom";
import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

interface PropTypes {
  data: StudentGradesResponse;
  classroomId: string;
}

export default function StudentGrades({ data, classroomId }: PropTypes) {
  const router = useRouter();
  const hasAssignments = data.assignments.length > 0;

  const handleRowClick = useCallback(
    (row: StudentGradeAssignment) => {
      router.push(`/mahasiswa/kelas/${classroomId}/tugas/${row.id}`);
    },
    [classroomId, router]
  );

  if (!hasAssignments) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-black">
        <ClipboardList className="size-12" />
        <p className="text-lg font-medium">Belum ada tugas</p>
        <p className="text-sm">Dosen belum membuat tugas di kelas ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="pb-4 border-b-2 flex items-center">
        <div className="text-base md:text-xl font-semibold">Daftar Nilai</div>
      </div>

      <DataTable
        columns={columns}
        data={data.assignments}
        onRowClick={handleRowClick}
      />

      {data.average !== null && data.average !== undefined && (
        <div className="flex items-center gap-2 text-sm font-medium bg-muted/50 border border-t-0 rounded-b-md px-4 py-3">
          <span>Rata-rata:</span>
          <span className="font-bold text-primary">
            {Math.round(data.average * 10) / 10}
          </span>
        </div>
      )}
    </div>
  );
}
