import * as XLSX from "xlsx";
import type { ClassroomGradesResponse } from "@/types/Classroom";

function formatDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function exportToGradesExcel(data: ClassroomGradesResponse, className?: string) {
  const header = ["Nama Mahasiswa", ...data.assignments.map((a) => a.title), "Rata-rata"];

  const body: (string | number)[][] = data.students.map((student) => {
    let sum = 0;
    let count = 0;
    const scores: (string | number)[] = data.assignments.map((a) => {
      const score = student.grades[a.id];
      if (score !== null && score !== undefined) {
        sum += score;
        count++;
        return score;
      }
      return "-";
    });
    const avg: string | number = count > 0 ? Math.round((sum / count) * 10) / 10 : "-";
    return [student.fullname, ...scores, avg];
  });

  const avgRow: (string | number)[] = ["Rata-rata Kelas"];
  let overallSum = 0;
  let overallCount = 0;
  data.assignments.forEach((a) => {
    const avg = data.averages[a.id];
    if (avg !== undefined && avg !== null) {
      avgRow.push(Math.round(avg * 10) / 10);
      overallSum += avg;
      overallCount++;
    } else {
      avgRow.push("-");
    }
  });
  const overallAvg: number | string = overallCount > 0 ? Math.round((overallSum / overallCount) * 10) / 10 : "-";
  avgRow.push(overallAvg);

  const wb = XLSX.utils.book_new();

  const wsData = [header, ...body, avgRow];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  const colWidths = [
    { wch: 25 },
    ...data.assignments.map(() => ({ wch: 15 })),
    { wch: 12 },
  ];
  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Nilai");

  const summaryData: (string | number)[][] = [
    ["Tugas", "Rata-rata Kelas"],
    ...data.assignments.map((a) => {
      const avg = data.averages[a.id];
      return [
        a.title,
        avg !== undefined && avg !== null
          ? Math.round(avg * 10) / 10
          : "-",
      ] as (string | number)[];
    }),
    ["Rata-rata Keseluruhan", overallAvg],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs["!cols"] = [{ wch: 30 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, "Rata-rata");

  const safeName = (className || "nilai-kelas").replace(/[/\\?%*:|"<>]/g, "_");
  XLSX.writeFile(wb, `Nilai_${safeName}_${formatDate()}.xlsx`);
}
