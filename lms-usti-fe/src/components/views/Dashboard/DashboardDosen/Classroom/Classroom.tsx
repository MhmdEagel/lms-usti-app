import { Suspense } from "react";
import ClassroomList from "./ClassroomList/ClassroomList";
import { Button } from "@/components/ui/button";
import { Filter, LayoutGrid, List } from "lucide-react";
import CreateClassroom from "./CreateClassroom";
import { SearchBar } from "@/components/ui/searchfield";
import { Skeleton } from "@/components/ui/skeleton";
import ClassroomSkeleton from "@/components/common/ClassroomSkeleton";
import FilterSheet from "@/components/common/FilterSheet";
import ActiveFilterCapsules from "@/components/common/ActiveFilterCapsules";
import Link from "next/link";

export default function Classroom({
  searchParams,
  page = 1,
  limit = 10,
}: {
  searchParams: { [key: string]: string | undefined };
  page?: number;
  limit?: number;
}) {
  const currentView = searchParams?.view === "list" ? "list" : "grid";

  function buildViewUrl(view: string) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val !== undefined) params.set(key, val);
    });
    params.set("view", view);
    params.set("page", "1");
    return `?${params.toString()}`;
  }

  return (
    <Suspense
      fallback={
        <div className="p-4">
          <div className="mb-4 flex flex-wrap gap-2 sm:gap-4 items-center">
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
      }
    >
      <div className="p-4">
        <div className="mb-4 flex flex-wrap gap-2 sm:gap-4 items-center">
          <div className="w-full sm:w-auto sm:flex-1 min-w-0">
            <SearchBar />
          </div>
          <div className="flex gap-1 border rounded-lg p-0.5">
            <Link
              href={buildViewUrl("grid")}
              className={`p-2 rounded-md transition-colors ${currentView === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </Link>
            <Link
              href={buildViewUrl("list")}
              className={`p-2 rounded-md transition-colors ${currentView === "list" ? "bg-muted" : "hover:bg-muted/50"}`}
              aria-label="List view"
            >
              <List className="size-4" />
            </Link>
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
        <ClassroomList searchParams={searchParams} page={page} limit={limit} view={currentView} />
      </div>
    </Suspense>
  );
}
