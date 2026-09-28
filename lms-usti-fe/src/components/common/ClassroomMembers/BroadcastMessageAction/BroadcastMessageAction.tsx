"use client";

import { Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

import useBroadcastMessage from "./useBroadcastMessage";

interface PropTypes {
  classroomId: string;
  recipientCount: number;
}

export default function BroadcastMessageAction({
  classroomId,
  recipientCount,
}: PropTypes) {
  const { form, open, handleOpen, handleClose, handleBroadcast, isPending } =
    useBroadcastMessage();

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) handleClose();
        else handleOpen(value);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Megaphone className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Kirim Broadcast</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" resetForm={handleClose}>
        <DialogHeader>
          <DialogTitle>Broadcast ke Mahasiswa</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {recipientCount > 0
            ? `Pesan akan dikirim sebagai notifikasi ke ${recipientCount} mahasiswa di kelas ini.`
            : "Belum ada mahasiswa yang bergabung di kelas ini."}
        </p>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) =>
              handleBroadcast(data, classroomId),
            )}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Judul pesan..."
                      {...field}
                      value={field.value ?? ""}
                      autoComplete="off"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis pesan untuk seluruh mahasiswa..."
                      rows={5}
                      {...field}
                      value={field.value ?? ""}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={handleClose}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending || recipientCount === 0}
              >
                {isPending ? "Mengirim..." : "Kirim Broadcast"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
