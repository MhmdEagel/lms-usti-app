import { Suspense } from "react";
import { classroomServices } from "@/services/classroom.service";
import { IClassroom } from "@/types/Classroom";
import ClassroomItem from "@/components/common/ClassroomItem/ClassroomItem";
import { SearchBar } from "@/components/ui/searchfield";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import ClassroomSkeleton from "@/components/common/ClassroomSkeleton";
import FilterSheet from "@/components/common/FilterSheet";
import ActiveFilterCapsules from "@/components/common/ActiveFilterCapsules";
import PaginationControls from "@/components/common/PaginationControls/PaginationControls";
import PaginationNav from "@/components/common/PaginationControls/PaginationNav";
import { Skeleton } from "@/components/ui/skeleton";

function ArchivedClassroomListSkeleton() {
  return (
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
  );
}

async function ArchivedClassroomListContent({
  type,
  searchParams,
  page,
  limit,
}: {
  type: "dosen" | "mahasiswa";
  searchParams: { [key: string]: string | undefined };
  page: number;
  limit: number;
}) {
  const search = searchParams?.search;
  const prodi = searchParams?.prodi;
  const term = searchParams?.term;
  const tahun_ajaran = searchParams?.tahun_ajaran;
  const room_number = searchParams?.room_number;
  const fetchFn =
    type === "dosen"
      ? classroomServices.findAllDosenClassrooms
      : classroomServices.findAllMahasiswaClassrooms;
  const res = await fetchFn(
    search || prodi || term || tahun_ajaran || room_number
      ? {
          search,
          prodi,
          term,
          tahun_ajaran,
          room_number,
          is_archived: "true",
          page,
          limit,
        }
      : { is_archived: "true", page, limit },
  );
  const pagination: PaginationInfo = res.data?.pagination;
  const classes: IClassroom[] = res.data.data;

  if (classes && classes.length > 0) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
          {classes.map((classroom) => (
            <ClassroomItem
              key={classroom.id}
              type={type}
              classroom={classroom}
              isArchived
            />
          ))}
        </div>
        {pagination && (
          <div className="flex flex-wrap gap-2 items-center justify-between mt-4">
            <PaginationControls
              current={pagination.current}
              limit={pagination.limit}
            />
            <PaginationNav
              current={pagination.current}
              totalPages={pagination.total_pages}
              total={pagination.total}
              limit={pagination.limit}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[500px] gap-4 select-none">
      <div className="text-center">
        <h2 className="text-xl md:text-3xl font-bold text-primary mb-1">
          Tidak ada kelas yang diarsipkan
        </h2>
        <p className="text-gray-500 text-base md:text-lg">
          Belum ada kelas yang diarsipkan.
        </p>
      </div>
    </div>
  );
}

export default function ArchivedClassroomList({
  type,
  searchParams,
  page = 1,
  limit = 10,
}: {
  type: "dosen" | "mahasiswa";
  searchParams: { [key: string]: string | undefined };
  page?: number;
  limit?: number;
}) {
  return (
    <Suspense fallback={<ArchivedClassroomListSkeleton />}>
      <div className="p-4">
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
            <div className="w-full sm:w-auto sm:flex-1 min-w-0">
              <SearchBar />
            </div>
            <FilterSheet>
              <Button className="cursor-pointer" variant={"outline"}>
                <Filter />
                Filter
              </Button>
            </FilterSheet>
          </div>
        </div>
        <ActiveFilterCapsules />
        <ArchivedClassroomListContent
          type={type}
          searchParams={searchParams}
          page={page}
          limit={limit}
        />
      </div>
    </Suspense>
  );
}
