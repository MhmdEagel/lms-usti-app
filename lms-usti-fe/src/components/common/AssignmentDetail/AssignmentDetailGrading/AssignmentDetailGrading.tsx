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
}

export default function AssignmentDetailGrading(props: PropTypes) {
  const { classroomId, assignmentId, page, limit, search } = props;

  return (
    <div className="p-4">
      <PenilaianData
        classroomId={classroomId}
        assignmentId={assignmentId}
        page={page}
        limit={limit}
        search={search}
      />
    </div>
  );
}
