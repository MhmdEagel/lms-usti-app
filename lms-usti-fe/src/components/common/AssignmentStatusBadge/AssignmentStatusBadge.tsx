import { cn } from "@/lib/utils";

interface PropTypes {
  totalStudents: number;
  totalSubmitted: number;
  totalGraded: number;
}

const statusConfig = {
  noSubmission: {
    label: "Belum ada pengumpulan",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  noGraded: {
    label: "Belum ada penilaian",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  inProgress: {
    label: "Dalam proses penilaian",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  allGraded: {
    label: "Sudah dinilai",
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

function getStatus(totalStudents: number, totalSubmitted: number, totalGraded: number) {
  if (totalSubmitted === 0) return statusConfig.noSubmission;
  if (totalGraded === 0) return statusConfig.noGraded;
  if (totalGraded < totalSubmitted) return statusConfig.inProgress;
  return statusConfig.allGraded;
}

export default function AssignmentStatusBadge({ totalStudents, totalSubmitted, totalGraded }: PropTypes) {
  const status = getStatus(totalStudents, totalSubmitted, totalGraded);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        status.className,
      )}
    >
      {status.label}
    </span>
  );
}
