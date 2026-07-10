import ClassroomItem from "@/components/common/ClassroomItem/ClassroomItem";
import { classroomServices } from "@/services/classroom.service";
import { IClassroom } from "@/types/Classroom";
import Image from "next/image";
import PaginationControls from "@/components/common/PaginationControls/PaginationControls";
import PaginationNav from "@/components/common/PaginationControls/PaginationNav";

export default async function ClassroomList({
  searchParams,
  page = 1,
  limit = 10,
}: {
  searchParams: { [key: string]: string | undefined };
  page?: number;
  limit?: number;
}) {
  const search = searchParams?.search;
  const prodi = searchParams?.prodi;
  const term = searchParams?.term;
  const tahun_ajaran = searchParams?.tahun_ajaran;
  const room_number = searchParams?.room_number;
  const res = await classroomServices.findAllDosenClassrooms(
    search || prodi || term || tahun_ajaran || room_number
      ? { search, prodi, term, tahun_ajaran, room_number, page, limit }
      : { page, limit },
  );
  const pagination: PaginationInfo = res.data?.pagination;
  const classes: IClassroom[] = res.data.data
  if (classes && classes.length > 0) {
    return (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
        {classes.map((classroom) => (
          <ClassroomItem
            type="dosen"
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
    <>
      <div className="flex flex-col h-[500px]  items-center justify-center gap-4 select-none">
        <Image
          src={"/images/ilustration/empty-class-dosen.svg"}
          className="w-48 h-48 sm:w-64 sm:h-64"
          alt="Kelas Kosong"
          width={300}
          height={300}
        />
        <div className="text-center">
          <h2 className="text-xl md:text-3xl font-bold text-primary mb-1">
            Tidak ada kelas
          </h2>
          <p className="text-gray-500 text-base md:text-lg">
            Sepertinya anda belum menambahkan kelas apapun.
          </p>
        </div>
      </div>
      
    </>
  );
}
