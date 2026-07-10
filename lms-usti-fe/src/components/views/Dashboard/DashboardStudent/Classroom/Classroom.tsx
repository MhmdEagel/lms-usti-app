import Image from "next/image";
import { Suspense } from "react";
import JoinClassroom from "./JoinClassroom/JoinClassroom";
import ClassroomItem from "@/components/common/ClassroomItem/ClassroomItem";
import { classroomServices } from "@/services/classroom.service";
import { IClassroom } from "@/types/Classroom";
import { SearchBar } from "@/components/ui/searchfield";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FilterSheet from "@/components/common/FilterSheet";
import ActiveFilterCapsules from "@/components/common/ActiveFilterCapsules";
import PaginationControls from "@/components/common/PaginationControls/PaginationControls";
import PaginationNav from "@/components/common/PaginationControls/PaginationNav";

function ClassroomListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="pt-3 space-y-8">
          <CardHeader className="px-3">
            <Skeleton className="h-[150px] w-full rounded-lg bg-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function ClassroomList({ searchParams: params, page = 1, limit = 10 }: { searchParams: { [key: string]: string | undefined }; page?: number; limit?: number }) {
  const search = params?.search;
  const prodi = params?.prodi;
  const term = params?.term;
  const tahun_ajaran = params?.tahun_ajaran;
  const room_number = params?.room_number;
  const res = await classroomServices.findAllMahasiswaClassrooms(
    search || prodi || term || tahun_ajaran || room_number
      ? { search, prodi, term, tahun_ajaran, room_number, page, limit }
      : { page, limit },
  );
  const pagination: PaginationInfo = res.data?.pagination;
  const classes: IClassroom[] = res.data.data;

  if (classes && classes.length > 0) {
    return (
      <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
          {classes.map((classroom) => (
            <ClassroomItem
              type="mahasiswa"
              key={classroom.id}
              classroom={classroom}
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
      <Image
        className="w-48 h-48 sm:w-64 sm:h-64"
        src={"/images/ilustration/empty-class.svg"}
        alt="Kelas Kosong"
        width={300}
        height={300}
      />
      <div className="text-center">
        <h2 className="text-xl md:text-3xl font-bold text-primary mb-1">
          Tidak ada kelas
        </h2>
        <p className="text-gray-500 text-base md:text-lg mb-2">
          Sepertinya kamu belum gabung ke kelas manapun.
        </p>
        <JoinClassroom />
      </div>
    </div>
  );
}

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
    <Suspense fallback={<ClassroomListSkeleton />}>
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
          <JoinClassroom />
        </div>
        <ActiveFilterCapsules />
        <ClassroomList searchParams={searchParams} page={page} limit={limit} />
      </div>
    </Suspense>
  );
}
