"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EditMaterialDialog from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/EditMaterialDialog";
import DeleteMaterialDialog from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/EditMaterialDialog/DeleteMaterialDialog/DeleteMaterialDialog";
import { IMaterial } from "@/types/Classroom";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

interface PropTypes {
  material: IMaterial;
  classroomId: string;
}

export default function MaterialAction(props: PropTypes) {
  const { material, classroomId } = props;
  const [openEditDialog, setOpenEditDialog] = useState("closed");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPopOver, setOpenPopOver] = useState(false);
  return (
    <>
      <Popover open={openPopOver} onOpenChange={setOpenPopOver}>
        <PopoverTrigger asChild>
          <Button type="button" variant={"ghost"}>
            <EllipsisVertical size={800} />
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
      <EditMaterialDialog
        open={openEditDialog}
        setOpen={setOpenEditDialog}
        classroomId={classroomId}
        material={material}
      />
      <DeleteMaterialDialog
        classroomId={classroomId}
        materialId={material.id}
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
      />
    </>
  );
}
