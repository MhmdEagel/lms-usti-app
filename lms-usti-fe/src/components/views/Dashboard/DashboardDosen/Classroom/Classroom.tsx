import { Suspense } from "react";
import ClassroomList from "./ClassroomList/ClassroomList";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import CreateClassroom from "./CreateClassroom";
import { SearchBar } from "@/components/ui/searchfield";
import { Skeleton } from "@/components/ui/skeleton";
import ClassroomSkeleton from "./ClassroomSkeleton";

export default function Classroom({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense
      fallback={
        <div className="p-4">
          <div className="mb-4 flex gap-4 items-center">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <ClassroomSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <div className="p-4">
        <div className="mb-4 flex gap-4 items-center">
          <SearchBar />
          <Button className="cursor-pointer" variant={"outline"}>
            <Filter />
            Filter
          </Button>
          <CreateClassroom />
        </div>
        <ClassroomList searchParams={searchParams} />
      </div>
    </Suspense>
  );
}
