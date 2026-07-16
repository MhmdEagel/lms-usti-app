import { GraduationCap, FileText } from "lucide-react"
import { classroomServices } from "@/services/classroom.service"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

export default async function MahasiswaDashboardStatsCards() {
  const res = await classroomServices.getMahasiswaDashboardStats()
  const stats = res.data?.data ?? null

  const cards = [
    {
      title: "Jumlah Kelas",
      value: stats?.total_classrooms ?? 0,
      icon: GraduationCap,
      bg: "bg-green-100",
      iconBg: "bg-green-500",
    },
    {
      title: "Tugas Belum Dikerjakan",
      value: stats?.total_pending_assignments ?? 0,
      icon: FileText,
      bg: "bg-orange-100",
      iconBg: "bg-orange-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className={card.bg}>
            <CardHeader className="flex-row items-center gap-3 sm:gap-4">
              <div className={`p-1.5 sm:p-2 text-white border rounded-full h-fit w-fit ${card.iconBg}`}>
                <Icon size={20} className="sm:size-[30px]" />
              </div>
              <CardTitle>
                <div>
                  <h3 className="text-[10px] sm:text-lg font-semibold">{card.title}</h3>
                  <p className="font-bold text-xl sm:text-2xl">{card.value}</p>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
