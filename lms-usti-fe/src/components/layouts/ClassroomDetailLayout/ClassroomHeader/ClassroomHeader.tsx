
import { CardContent } from "@/components/ui/card";
import { getDayName, getTimeString } from "@/lib/utils";
import { UserDetail } from "@/types/User";
import dayjs from "dayjs";
import ShareClassroomCode from "../ShareClassroomCode/ShareClassroomCode";

interface PropTypes {
  class_code: string;
  class_name: string;
  room_number: number;
  day: number;
  class_start: string;
  class_end: string;
  dosen: UserDetail;
  type: "mahasiswa" | "dosen";
  term: number;
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
    type,
    term,
  } = props;


  return (
    <div>
      <CardContent className="bg-white/80 pt-4 pb-8 border mt-0 absolute bottom-0 left-0 right-0">
        <>
          <div className="font-bold text-primary text-lg truncate">{class_name}</div>
          <div className="text-sm sm:text-base">Ruangan {room_number}</div>
          <div className="text-sm sm:text-base">Semester {term}</div>
          <div className="text-sm sm:text-base">
            {getDayName(day)}, {getTimeString(dayjs(class_start).toDate())} -{" "}
            {getTimeString(dayjs(class_end).toDate())}
          </div>
          <div className="font-bold truncate">{dosen.fullname}</div>
        </>
      </CardContent>
      <div className="absolute top-2 right-2 flex gap-2">
        {type === "dosen" ? (
          <ShareClassroomCode classroomCode={class_code} />
        ) : null}
      </div>
    </div>
  );
}
