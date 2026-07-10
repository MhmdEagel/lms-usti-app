import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClassroomSkeleton() {
  return (
    <Card className="pt-3 space-y-8">
      <CardHeader className="px-3">
        <Skeleton className="h-[150px] w-full rounded-lg bg-blue-200" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center">
          <Skeleton className="size-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
