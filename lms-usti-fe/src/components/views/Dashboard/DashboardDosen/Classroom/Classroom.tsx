import { Suspense } from "react";
import ClassroomList from "./ClassroomList/ClassroomList";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import CreateClassroom from "./CreateClassroom";
import { SearchBar } from "@/components/ui/searchfield";

export default function Classroom({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-full">
          <Spinner size={80} className="text-primary" variant="circle" />
        </div>
      }
    >
      <div className="p-4">
        <div className="mb-4 flex gap-4 items-center">
          <SearchBar />
          <Button className="cursor-pointer" variant={"outline"}>
            <Filter />
          </Button>
          <CreateClassroom />
        </div>
        <ClassroomList searchParams={searchParams} />
      </div>
    </Suspense>
  );
}
