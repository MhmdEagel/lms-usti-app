import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheckBig, GraduationCap } from "lucide-react";

export default async function DashboardStudent() {
  return (
    <div>
      <h2 className="mb-8 text-lg md:text-xl">Selamat datang!</h2>
      <section className="flex gap-4 mt-4">
        <Card className="min-w-[240px] bg-green-100">
          <CardHeader className="flex-row items-center gap-4">
            <div className="p-2 text-white bg-green-500 border rounded-full h-fit w-fit">
              <GraduationCap size={30} />
            </div>
            <CardTitle className="text-lg md:text-xl">
              <div>
                <h3 className="font-bold">Jumlah Kelas</h3>
                <p className="font-normal">100</p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="min-w-[240px] bg-red-100">
          <CardHeader className="flex-row items-center gap-4">
            <div className="p-2 text-white bg-red-500 border rounded-full h-fit w-fit">
              <CircleCheckBig size={30} />
            </div>
            <CardTitle className="text-lg md:text-xl">
              <div>
                <h3 className="font-bold">Jumlah Tugas</h3>
                <p className="font-normal">100 dari 200</p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </section>
      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Jadwal Perkuliahan</CardTitle>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
