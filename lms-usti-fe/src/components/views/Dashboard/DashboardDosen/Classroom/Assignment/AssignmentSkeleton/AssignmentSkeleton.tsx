import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentSkeleton() {
  return (
    <div>
      <div className="flex justify-between border-b-2 pb-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-7 w-9" />
      </div>
      <div className="mt-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
