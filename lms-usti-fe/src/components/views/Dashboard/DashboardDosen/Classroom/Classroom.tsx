import { Suspense } from "react";
import ClassroomList from "./ClassroomList/ClassroomList";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import CreateClassroom from "./CreateClassroom";
import { SearchBar } from "@/components/ui/searchfield";
import { Skeleton } from "@/components/ui/skeleton";
import ClassroomSkeleton from "@/components/common/ClassroomSkeleton";
import FilterSheet from "@/components/common/FilterSheet";
import ActiveFilterCapsules from "@/components/common/ActiveFilterCapsules";

export default function Classroom({
  searchParams,
  page = 1,
  limit = 10,
}: {
  searchParams: { [key: string]: string | undefined };
  page?: number;
  limit?: number;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-4">
          <div className="mb-4 flex flex-wrap gap-2 sm:gap-4 items-center">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <ClassroomSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <div className="p-4">
        <div className="mb-4 flex flex-wrap gap-2 sm:gap-4 items-center">
          <div className="w-full sm:w-auto sm:flex-1 min-w-0">
            <SearchBar />
          </div>
          <FilterSheet>
            <Button className="cursor-pointer" variant={"outline"}>
              <Filter />
              Filter
            </Button>
          </FilterSheet>
          <CreateClassroom />
        </div>
        <ActiveFilterCapsules />
        <ClassroomList searchParams={searchParams} page={page} limit={limit} />
      </div>
    </Suspense>
  );
}
