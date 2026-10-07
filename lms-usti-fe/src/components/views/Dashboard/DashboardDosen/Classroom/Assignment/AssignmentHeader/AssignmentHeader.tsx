import type { ReactNode } from "react";

interface PropTypes {
  action?: ReactNode;
}

export default function AssignmentHeader({ action }: PropTypes) {
  return (
    <div className="pb-4 border-b-2 flex items-center justify-between gap-2">
      <div className="text-base md:text-xl font-semibold">Tugas Kelas</div>
      {action}
    </div>
  );
}
