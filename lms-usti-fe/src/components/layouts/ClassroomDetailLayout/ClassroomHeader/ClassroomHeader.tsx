import { CardContent } from "@/components/ui/card";
import { getDayName, getTimeString } from "@/lib/utils";
import { UserDetail } from "@/types/User";
import ShareClassroomCode from "../ShareClassroomCode/ShareClassroomCode";

interface PropTypes {
  class_code: string;
  class_name: string;
  room_number: number;
  day: number;
  class_start: string;
  class_end: string;
  prodi: string;
  dosen: UserDetail;
  type: "mahasiswa" | "dosen";
  term: number;
  isArchived?: boolean;
}
export default function ClassroomHeader(props: PropTypes) {
  const {
    class_code,
    class_name,
    room_number,
    day,
    class_start,
    class_end,
    dosen,
    prodi,
    type,
    term,
    isArchived,
  } = props;

  return (
    <div>
      <CardContent className="bg-white/80 pt-3 pb-6 sm:pt-4 sm:pb-8 border mt-0 absolute bottom-0 left-0 right-0">
        <>
          <div className="font-bold text-primary text-xs sm:text-sm md:text-lg truncate">
            {class_name}
          </div>
          <div className="font-bold truncate mb-1 sm:mb-2 text-[10px] sm:text-sm md:text-base">{dosen.fullname}</div>
          <div className="text-[10px] sm:text-sm md:text-base">Semester {term}</div>
          <div className="text-[10px] sm:text-sm md:text-base">Ruangan {room_number}</div>
          <div className="text-[10px] sm:text-sm md:text-base">
            {getDayName(day)}, {getTimeString(class_start)} -{" "}
            {getTimeString(class_end)}
          </div>
          <div className="text-[10px] sm:text-sm md:text-base">Prodi {prodi}</div>
        </>
      </CardContent>
      <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-2">
        {type === "dosen" && !isArchived ? (
          <ShareClassroomCode classroomCode={class_code} />
        ) : null}
      </div>
    </div>
  );
}
