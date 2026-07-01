import Link from "next/link"
import { ClipboardList, Clock, ChevronRight } from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/id"
import { getWaitingGrade } from "@/actions/get-waiting-grade"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser } from "@/lib/auth"
import { environtment } from "@/config/environtment"
import { redirect } from "next/navigation"

dayjs.extend(relativeTime)
dayjs.locale("id")

export default async function WaitingGradeList() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const waitingGrades = await getWaitingGrade()

  const grouped = waitingGrades.reduce<Record<string, typeof waitingGrades>>((acc, wg) => {
    if (!acc[wg.classroom_id]) {
      acc[wg.classroom_id] = []
    }
    acc[wg.classroom_id].push(wg)
    return acc
  }, {})

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <ClipboardList size={24} />
          Tugas: Menunggu Penilaian
        </CardTitle>
      </CardHeader>
      <CardContent>
        {waitingGrades.length === 0 ? (
          <p className="text-muted-foreground text-sm">Tidak ada tugas yang menunggu penilaian.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([classroomId, items]) => (
              <Card key={classroomId}>
                <CardHeader>
                  <CardTitle className="text-base">{items[0].classroom_name}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3">
                  {items.map((wg) => (
                    <Link key={wg.submission_id} href={`/dosen/kelas/${classroomId}/tugas/${wg.assignment_id}/penilaian`}>
                      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="pl-4 pr-8">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-10 shrink-0">
                              <AvatarImage src={wg.mahasiswa_profile ? `${environtment.API_URL}/media/profiles/${wg.mahasiswa_profile}` : undefined} alt={wg.mahasiswa_name} />
                              <AvatarFallback>
                                {wg.mahasiswa_name?.charAt(0)?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{wg.assignment_title}</p>
                              <p className="text-sm text-muted-foreground truncate">{wg.mahasiswa_name}</p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                                <Clock size={14} />
                                <span>{dayjs(wg.submission_date).fromNow()}</span>
                              </div>
                            </div>
                            <ChevronRight size={24} className="shrink-0 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
