"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import EditAssignmentDialog from "@/components/views/Dashboard/DashboardDosen/Classroom/Assignment/EditAssignmentDialog";
import DeleteAssignmentDialog from "@/components/views/Dashboard/DashboardDosen/Classroom/Assignment/EditAssignmentDialog/DeleteAssignmentDialog/DeleteAssignmentDialog";
import { IAssignment } from "@/types/Classroom";
import { useState } from "react";

interface PropTypes {
  assignment: IAssignment;
  classroomId: string;
}

export default function AssignmentAction(props: PropTypes) {
  const { assignment, classroomId } = props;
  const [openEditDialog, setOpenEditDialog] = useState("closed");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenEditDialog("open")}
          type="button"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenDeleteDialog(true)}
          type="button"
          className="text-red-500 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Hapus
        </Button>
      </div>
      <EditAssignmentDialog
        open={openEditDialog}
        setOpen={setOpenEditDialog}
        classroomId={classroomId}
        assignment={assignment}
      />
      <DeleteAssignmentDialog
        classroomId={classroomId}
        assignmentId={assignment.id!}
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
      />
    </>
  );
}
