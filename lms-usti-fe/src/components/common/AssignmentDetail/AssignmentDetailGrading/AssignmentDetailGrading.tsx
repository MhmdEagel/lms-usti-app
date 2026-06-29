import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AssignmentDetailTabNavbar from "../AssignmentDetailTabNavbar/AssignmentDetailTabNavbar";
import PenilaianData from "./PenilaianData";

interface PropTypes {
  classroomId: string;
  assignmentId: string;
  page: number;
  limit: number;
  search: string;
  filter: string;
}

export default function AssignmentDetailGrading(props: PropTypes) {
  const { classroomId, assignmentId, page, limit, search, filter } = props;

  return (
    <div className="p-4">
      <Link className="mb-2" href={`/dosen/kelas/${classroomId}/tugas`}>
        <Button className="rounded-full" variant="ghost">
          <ArrowLeft /> Kembali
        </Button>
      </Link>
      <AssignmentDetailTabNavbar
        classroomId={classroomId}
        assignmentId={assignmentId}
        type="dosen"
      />
      <PenilaianData
        classroomId={classroomId}
        assignmentId={assignmentId}
        page={page}
        limit={limit}
        search={search}
        filter={filter}
      />
    </div>
  );
}
