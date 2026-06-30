"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import EditMaterialDialog from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/EditMaterialDialog";
import DeleteMaterialDialog from "@/components/views/Dashboard/DashboardDosen/Classroom/Material/EditMaterialDialog/DeleteMaterialDialog/DeleteMaterialDialog";
import { IMaterial } from "@/types/Classroom";
import { useState } from "react";

interface PropTypes {
  material: IMaterial;
  classroomId: string;
}

export default function MaterialAction(props: PropTypes) {
  const { material, classroomId } = props;
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
