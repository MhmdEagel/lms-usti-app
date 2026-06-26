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

function ClassroomListSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="pt-3 space-y-8">
          <CardHeader className="px-3">
            <Skeleton className="h-[150px] w-full rounded-lg bg-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-[180px] sm:w-[270px]" />
                <Skeleton className="h-4 w-[160px] sm:w-[240px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function ClassroomList({ searchParams: params }: { searchParams: { [key: string]: string | undefined } }) {
  const search = params?.search;
  const prodi = params?.prodi;
  const term = params?.term;
  const tahun_ajaran = params?.tahun_ajaran;
  const room_number = params?.room_number;
  const res = await classroomServices.findAllMahasiswaClassrooms(
    search || prodi || term || tahun_ajaran || room_number
      ? { search, prodi, term, tahun_ajaran, room_number }
      : undefined,
  );
  const classes: IClassroom[] = res.data.data;

  if (classes && classes.length > 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-auto">
        {classes.map((classroom) => (
          <ClassroomItem
            type="mahasiswa"
            key={classroom.id}
            classroom={classroom}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[500px] gap-4 select-none">
      <Image
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
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<ClassroomListSkeleton />}>
      <div className="p-4">
        <div className="mb-4 flex gap-4 items-center">
          <SearchBar />
          <FilterSheet>
            <Button className="cursor-pointer" variant={"outline"}>
              <Filter />
              Filter
            </Button>
          </FilterSheet>
          <JoinClassroom />
        </div>
        <ActiveFilterCapsules />
        <ClassroomList searchParams={searchParams} />
      </div>
    </Suspense>
  );
}
