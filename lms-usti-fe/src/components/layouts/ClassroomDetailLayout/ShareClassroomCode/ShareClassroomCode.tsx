"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "lucide-react";
import { useState } from "react";

interface PropTypes {
  classroomCode: string;
}

export default function ShareClassroomCode(props: PropTypes) {
  const { classroomCode } = props;
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => setOpen(true)} size={"icon"}>
            <Link />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bagikan Kode Kelas</p>
        </TooltipContent>
      </Tooltip>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bagikan Kode</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              Silahkan bagikan kode di bawah ini ke mahasiswa yang ingin
              bergabung
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="sm:text-4xl font-bold text-center">{classroomCode}</div>
          <AlertDialogFooter>
            <AlertDialogAction>Oke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
