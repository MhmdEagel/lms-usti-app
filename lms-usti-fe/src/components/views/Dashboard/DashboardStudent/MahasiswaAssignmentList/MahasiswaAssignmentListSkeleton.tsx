import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export default function MahasiswaAssignmentListSkeleton() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <Skeleton className="h-6 w-56" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full shrink-0 ml-3" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
