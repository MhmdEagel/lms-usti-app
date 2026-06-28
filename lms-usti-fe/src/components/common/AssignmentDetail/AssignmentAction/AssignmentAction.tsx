"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EditAssignmentDialog from "@/components/views/Dashboard/DashboardDosen/Classroom/Assignment/EditAssignmentDialog";
import DeleteAssignmentDialog from "@/components/views/Dashboard/DashboardDosen/Classroom/Assignment/EditAssignmentDialog/DeleteAssignmentDialog/DeleteAssignmentDialog";
import { IAssignment } from "@/types/Classroom";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

interface PropTypes {
  assignment: IAssignment;
  classroomId: string;
}

export default function AssignmentAction(props: PropTypes) {
  const { assignment, classroomId } = props;
  const [openEditDialog, setOpenEditDialog] = useState("closed");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPopOver, setOpenPopOver] = useState(false);
  return (
    <>
      <Popover open={openPopOver} onOpenChange={setOpenPopOver}>
        <PopoverTrigger asChild>
          <Button type="button" variant={"ghost"}>
            <EllipsisVertical className="size-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-fit p-4">
          <div>
            <Button
              variant={"ghost"}
              onClick={() => {
                setOpenEditDialog("open");
                setOpenPopOver(false);
              }}
              type="button"
              className="block text-left"
            >
              Edit
            </Button>
            <Button
              onClick={() => {
                setOpenDeleteDialog(true);
              }}
              variant={"ghost"}
              className="text-left block"
            >
              Hapus
            </Button>
          </div>
        </PopoverContent>
      </Popover>
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
