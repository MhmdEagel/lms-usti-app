import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="bg-white min-h-[450px]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6 space-y-6">

        {/* Card 1 — Avatar */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="size-24 md:size-[96px] rounded-full" />
              <div className="text-center space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 — Informasi Pribadi */}
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="border-b px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-9 w-20" />
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-40" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
