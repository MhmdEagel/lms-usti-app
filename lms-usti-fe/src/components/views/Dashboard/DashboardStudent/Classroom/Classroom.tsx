import Image from "next/image";
import JoinClassroom from "./JoinClassroom/JoinClassroom";
import ClassroomItem from "@/components/common/ClassroomItem/ClassroomItem";
import { classroomServices } from "@/services/classroom.service";
import { IClassroom } from "@/types/Classroom";

export default async function Classroom() {
  const res = await classroomServices.findAllMahasiswaClassrooms();
  const classes: IClassroom[] = res.data.data;
  if (classes && classes.length > 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl mx-auto">
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
    <>
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Image
          src={"/images/ilustration/empty-class.svg"}
          alt="Kelas Kosong"
          width={250}
          height={250}
        />
        <div className="text-center">
          <h2 className="text-xl md:text-2xl text-primary font-bold">Tidak ada kelas</h2>
          <p className="mb-2 text-gray-500 text-sm md:text-base">
            Sepertinya kamu belum gabung ke kelas manapun.
          </p>
          <JoinClassroom />
        </div>
      </div>
    </>
  );
}
