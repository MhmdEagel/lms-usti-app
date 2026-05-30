import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MaterialSkeleton() {
  return (
    <div>
      <div className="flex justify-between border-b-2 pb-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-7 w-9" />
      </div>
      <Card className="mt-4">
        <CardContent>
          <div className="flex gap-4 items-center">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
