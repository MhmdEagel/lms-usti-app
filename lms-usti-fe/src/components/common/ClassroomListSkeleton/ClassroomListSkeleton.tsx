import { Skeleton } from "@/components/ui/skeleton";
import ClassroomSkeleton from "../ClassroomSkeleton";

export default function ClassroomListSkeleton() {
  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2 sm:gap-4 items-center">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <ClassroomSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
