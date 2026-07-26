"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { toISOTime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PROGRAM_STUDI from "@/constants/programStudi.constant";
import CLASS_DAYS from "@/constants/ClassDays.constant";
import { classroomServices } from "@/services/classroom.service";
import type { CalendarEvent } from "./WeeklyCalendar";

const editClassroomSchema = z.object({
  class_name: z.string({ required_error: "Nama Kelas wajib diisi" }),
  room_number: z
    .string({ required_error: "Ruang wajib diisi" })
    .min(1, "Ruang wajib diisi")
    .regex(/^\d+$/, "Ruang wajib diisi"),
  term: z
    .string({ required_error: "Semester wajib diisi" })
    .min(1, "Semester wajib diisi")
    .regex(/^\d+$/, "Semester wajib diisi"),
  day: z.string({ required_error: "Hari wajib dipilih" }),
  class_start: z.string({ required_error: "Jam mulai kelas wajib diisi" }),
  class_end: z.string({ required_error: "Jam selesai kelas wajib diisi" }),
  prodi: z.string({ required_error: "Program studi wajib dipilih" }),
  tahun_ajaran: z
    .string({ required_error: "Tahun ajaran wajib diisi" })
    .regex(/^\d{4}\/\d{4}$/, "Format tahun ajaran tidak sesuai (contoh: 2025/2026)"),
}).refine((data) => data.class_start < data.class_end, {
  message: "Jam selesai kelas harus lebih besar dari jam mulai kelas",
  path: ["time_end"],
});

interface PropTypes {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent;
  onUpdated: () => void;
}

export default function EditClassroomDialog({
  open,
  onOpenChange,
  event,
  onUpdated,
}: PropTypes) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    defaultValues: {
      class_name: event.title,
      room_number: String(event.extendedProps.roomNumber),
      term: String(event.extendedProps.term),
      day: String(event.daysOfWeek[0]),
      class_start: event.startTime,
      class_end: event.endTime,
      prodi: event.extendedProps.prodi,
      tahun_ajaran: event.extendedProps.tahunAjaran ?? "",
    },
    resolver: zodResolver(editClassroomSchema),
  });

  const handleSubmit = async (data: z.infer<typeof editClassroomSchema>) => {
    try {
      setIsPending(true);
      await classroomServices.update(
        {
          class_name: data.class_name,
          room_number: Number(data.room_number),
          term: Number(data.term),
          day: parseInt(data.day, 10),
          class_start: toISOTime(data.class_start),
          class_end: toISOTime(data.class_end),
          prodi: data.prodi,
          tahun_ajaran: data.tahun_ajaran,
        },
        event.extendedProps.classroomId,
      );
      toast.success("Kelas berhasil diperbarui");
      onUpdated();
      onOpenChange(false);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { meta?: { message?: string } } } };
      const message =
        err?.response?.data?.meta?.message ??
        (e as Error).message ??
        "Gagal memperbarui kelas";
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto max-h-150">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Kelas</DialogTitle>
              <DialogDescription>
                Ubah data kelas yang sudah ada.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="class_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kelas</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Kelas" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="room_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Ruangan</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nomor Ruangan"
                        inputMode="numeric"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Semester"
                        inputMode="numeric"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="class_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Mulai</FormLabel>
                    <FormControl>
                      <Input type="time" placeholder="Waktu Mulai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="class_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Selesai</FormLabel>
                    <FormControl>
                      <Input type="time" placeholder="Waktu Selesai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hari Kelas</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Hari" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLASS_DAYS.map((item) => (
                          <SelectItem key={item.id} value={item.value}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prodi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Studi</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Program Studi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROGRAM_STUDI.map((item) => (
                          <SelectItem key={item.id} value={item.value}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tahun_ajaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun Ajaran</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: 2025/2026"
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
