"use client";

import type { StudentGradesResponse } from "@/types/Classroom";
import { Book, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

interface PropTypes {
  data: StudentGradesResponse;
  classroomId: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  not_submitted: { label: "Belum Dikerjakan", className: "bg-gray-100 text-gray-500" },
  submitted: { label: "Belum Dinilai", className: "bg-yellow-100 text-yellow-700" },
  graded: { label: "Sudah Dinilai", className: "bg-green-100 text-green-700" },
};

export default function StudentGrades({ data, classroomId }: PropTypes) {
  const router = useRouter();
  const hasAssignments = data.assignments.length > 0;

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

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-4 py-3 text-left font-medium text-black whitespace-nowrap min-w-[200px]">
                Nama Tugas
              </th>
              <th className="px-4 py-3 text-left font-medium text-black whitespace-nowrap min-w-[80px]">
                Nilai
              </th>
              <th className="px-4 py-3 text-left font-medium text-black whitespace-nowrap min-w-[140px]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.assignments.map((assignment) => {
              const config = statusConfig[assignment.status] || statusConfig.not_submitted;
              return (
                <tr
                  key={assignment.id}
                  className="border-t hover:bg-blue-50 cursor-pointer"
                  onClick={() => router.push(`/mahasiswa/kelas/${classroomId}/tugas/${assignment.id}`)}
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-black">
                    {assignment.title}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-black">
                    {assignment.score !== null && assignment.score !== undefined
                      ? assignment.score
                      : <span className="text-black">-</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                      {config.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            <tr className="border-t bg-blue-100 font-semibold">
              <td className="px-4 py-3 whitespace-nowrap text-black">Rata-rata</td>
              <td className="px-4 py-3 whitespace-nowrap text-black" colSpan={2}>
                {data.average !== null && data.average !== undefined
                  ? Math.round(data.average * 10) / 10
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
