import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PropTypes {
  type?: "dosen" | "mahasiswa";
}

export default function AssignmentDetailSkeleton({ type = "dosen" }: PropTypes) {
  return (
    <div className="p-4">
      <div className="flex gap-1 mb-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Skeleton className="h-9 w-28 rounded-full mb-2" />

      {type === "dosen" && (
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      )}

      <div className="p-4 w-full max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex gap-4 items-start w-full">
              <Skeleton className="h-14 w-14 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              {type === "dosen" && <Skeleton className="h-8 w-20" />}
              {type === "mahasiswa" && (
                <div className="text-right space-y-1">
                  <Skeleton className="h-8 w-16 ml-auto" />
                  <Skeleton className="h-4 w-12 ml-auto" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>

      <div className="p-4 w-full">
        <Card>
          <CardHeader className="border-b-2 pb-2">
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="h-23 flex items-center justify-center">
              <Skeleton className="h-12 w-48" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 w-full">
        <Card>
          <CardHeader className="border-b-2 pb-2">
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 w-full">
        <Card>
          <CardHeader className="border-b-2 pb-2">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
