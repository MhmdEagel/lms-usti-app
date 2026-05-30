import { Skeleton } from "@/components/ui/skeleton";

export default function MembersSkeleton() {
  return (
    <div className="space-y-6">
          <div className="border-b-2 pb-6">
            <Skeleton className="h-[20px] w-[100px] rounded-full mb-4" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-[50px] w-[50px] rounded-full" />
              <Skeleton className="h-[20px] w-[200px] rounded-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-[20px] w-[100px] rounded-full mb-4" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-[50px] w-[50px] rounded-full" />
                <Skeleton className="h-[20px] w-[200px] rounded-full" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-[50px] w-[50px] rounded-full" />
                <Skeleton className="h-[20px] w-[200px] rounded-full" />
              </div>
            </div>
          </div>
        </div>
  )
}
