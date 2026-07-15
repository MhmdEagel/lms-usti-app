"use client";

import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCreateMeetingDialog } from "./useCreateMeetingDialog";
import type { IMeeting } from "@/types/Classroom";

interface PropTypes {
  classroomId: string;
  meeting?: IMeeting;
  trigger?: "button" | "icon";
}

export default function CreateMeetingDialog({ classroomId, meeting, trigger = "button" }: PropTypes) {
  const { form, open, setOpen, isPending, handleSubmit, handleClose, isEdit } =
    useCreateMeetingDialog(classroomId, meeting);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(v); }}>
      {trigger === "icon" ? (
        <Tooltip>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent>{isEdit ? "Edit Pertemuan" : "Buat Pertemuan"}</TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Buat Pertemuan
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pertemuan" : "Buat Pertemuan"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topik</FormLabel>
                  <FormControl>
                    <Input placeholder="Topik pertemuan..." {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deskripsi pertemuan..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : isEdit ? "Simpan" : "Buat"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}