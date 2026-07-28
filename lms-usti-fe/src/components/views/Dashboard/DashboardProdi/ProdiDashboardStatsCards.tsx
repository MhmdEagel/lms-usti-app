import { GraduationCap, Users, School } from "lucide-react";
import { classroomServices } from "@/services/classroom.service";
import { Card as UICard, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProdiDashboardStatsCards() {
  const res = await classroomServices.getProdiDashboardStats();
  const stats = res.data?.data ?? null;

  const cards = [
    {
      title: "Kelas Aktif",
      value: stats?.total_active_classrooms ?? 0,
      icon: GraduationCap,
      bg: "bg-green-100",
      iconBg: "bg-green-500",
    },
    {
      title: "Total Dosen",
      value: stats?.total_dosen ?? 0,
      icon: Users,
      bg: "bg-blue-100",
      iconBg: "bg-blue-500",
    },
    {
      title: "Total Mahasiswa",
      value: stats?.total_mahasiswa ?? 0,
      icon: School,
      bg: "bg-purple-100",
      iconBg: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
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
        );
      })}
    </div>
  );
}
