import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MeetingSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="flex flex-row gap-2 mb-4 mt-2 overflow-x-auto">
        <div className="inline-flex w-full justify-start items-center p-0 min-w-max pb-3 sm:pb-0">
          <div className="w-full border-b-[1.5px] flex flex-row gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
