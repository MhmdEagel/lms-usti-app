import Link from "next/link"
import { ClipboardList } from "lucide-react"
import { classroomServices } from "@/services/classroom.service"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import dayjs from "dayjs"
import "dayjs/locale/id"
import type { IMahasiswaDashboardStats } from "@/types/Classroom"

dayjs.locale("id")

function formatDeadline(deadline: string | null): string {
  if (!deadline) return "Tidak ada deadline"
  return dayjs(deadline).format("DD MMM YYYY, HH:mm")
}

export default async function MahasiswaAssignmentList() {
  const res = await classroomServices.getMahasiswaDashboardStats(); const stats: IMahasiswaDashboardStats | null = res.data?.data ?? null

  if (!stats) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <ClipboardList size={20} className="sm:size-6" />
          Tugas Yang Perlu Dikerjakan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stats.upcoming_assignments.length === 0 ? (
          <p className="text-muted-foreground text-sm">Semua tugas sudah dikerjakan</p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto flex flex-col gap-2 pr-1">
            {stats.upcoming_assignments.map((item) => (
              <Link
                key={item.assignment_id}
                href={`/mahasiswa/kelas/${item.classroom_id}/tugas/${item.assignment_id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{item.assignment_title}</p>
                  <p className="text-sm text-muted-foreground truncate">{item.classroom_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDeadline(item.deadline)}</p>
                </div>
                {item.days_remaining !== null && (
                  <span className={`shrink-0 ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                    item.days_remaining < 0
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {item.days_remaining < 0 ? "Terlambat" : `${item.days_remaining} hari lagi`}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
