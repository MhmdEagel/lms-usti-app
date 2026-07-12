import { GraduationCap, Users, FileText } from "lucide-react"
import { getDashboardStats } from "@/actions/get-dashboard-stats"
import { Card as UICard, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardStatsCards() {
  const stats = await getDashboardStats()

  const cards = [
    {
      title: "Jumlah Kelas",
      value: stats?.total_classrooms ?? 0,
      icon: GraduationCap,
      bg: "bg-green-100",
      iconBg: "bg-green-500",
    },
    {
      title: "Jumlah Mahasiswa",
      value: stats?.total_students ?? 0,
      icon: Users,
      bg: "bg-blue-100",
      iconBg: "bg-blue-500",
    },
    {
      title: "Jumlah Tugas",
      value: stats?.total_assignments ?? 0,
      icon: FileText,
      bg: "bg-orange-100",
      iconBg: "bg-orange-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <UICard key={card.title} className={card.bg}>
            <CardHeader className="flex-row items-center gap-4">
              <div className={`p-2 text-white border rounded-full h-fit w-fit ${card.iconBg}`}>
                <Icon size={24} className="sm:size-[30px]" />
              </div>
              <CardTitle className="text-lg md:text-xl">
                <div>
                  <h3 className="text-sm font-medium">{card.title}</h3>
                  <p className="font-bold text-2xl">{card.value}</p>
                </div>
              </CardTitle>
            </CardHeader>
          </UICard>
        )
      })}
    </div>
  )
}
