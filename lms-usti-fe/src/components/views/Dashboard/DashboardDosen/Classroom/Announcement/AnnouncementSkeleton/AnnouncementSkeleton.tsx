import { Skeleton } from "@/components/ui/skeleton";

export default function AnnouncementSkeleton() {
  return (
    <>
      <div className="flex items-center border-b-2 pb-4">
        <Skeleton className="w-[200px] h-[20px] rounded-full" />
        <Skeleton className="w-[40px] h-[40px] rounded-lg ml-auto" />
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="w-[50px] h-[50px] rounded-full" />
        <div className="space-y-2 w-full">
          <Skeleton className="w-[200px] h-[20px] rounded-full" />
          <Skeleton className="w-[100px] h-[20px] rounded-full" />
          <div className="mt-6 space-y-2">
            <Skeleton className="h-[20px] rounded-full" />
            <Skeleton className="h-[20px] rounded-full" />
            <Skeleton className="h-[20px] rounded-full" />
          </div>
        </div>
      </div>
    </>
  );
}
