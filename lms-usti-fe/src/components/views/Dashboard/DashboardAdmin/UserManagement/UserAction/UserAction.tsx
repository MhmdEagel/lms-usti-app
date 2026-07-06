"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EditUserDialog from "../EditUserDialog/EditUserDialog";
import DeleteUserDialog from "../DeleteUserDialog/DeleteUserDialog";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

type UserActionProps = {
  user: IUser;
};

export default function UserAction({ user }: UserActionProps) {
  const [openPopOver, setOpenPopOver] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <>
      <Popover open={openPopOver} onOpenChange={setOpenPopOver}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-fit p-4">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              className="block text-left w-full"
              onClick={() => {
                setOpenEditDialog(true);
                setOpenPopOver(false);
              }}
              type="button"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              className="block text-left w-full text-red-600 hover:text-red-700"
              onClick={() => {
                setOpenDeleteDialog(true);
                setOpenPopOver(false);
              }}
              type="button"
            >
              Hapus
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <EditUserDialog
        isOpen={openEditDialog}
        setIsOpen={setOpenEditDialog}
        id={user.id}
        onSuccess={() => setOpenEditDialog(false)}
      />
      <DeleteUserDialog
        isOpen={openDeleteDialog}
        setIsOpen={setOpenDeleteDialog}
        id={user.id}
      />
    </>
  );
}
