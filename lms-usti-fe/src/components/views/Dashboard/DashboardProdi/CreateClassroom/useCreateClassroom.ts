"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { classroomServices } from "@/services/classroom.service";
import { useRouter } from "next/navigation";
import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const prodiClassroomSchema = z.object({
  class_cover: z.string({ required_error: "Cover kelas harus dipilih" }),
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
  dosen_id: z.string({ required_error: "Dosen wajib dipilih" }).min(1, "Dosen wajib dipilih"),
}).refine(
  (data) => {
    return data.class_start < data.class_end;
  },
  {
    message: "Jam selesai kelas harus lebih besar dari jam mulai kelas",
    path: ["time_end"],
  },
);

const useCreateClassroom = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [coverPreview, setCoverPreview] = useState("basic");

  const createClassForm = useForm({
    defaultValues: {
      class_cover: "basic",
      room_number: "",
      term: "",
      day: "",
      class_start: "",
      class_end: "",
      prodi: "",
      tahun_ajaran: "",
      dosen_id: "",
    },
    resolver: zodResolver(prodiClassroomSchema),
  });

  const handleCloseForm = () => {
    setIsOpen(false);
    createClassForm.reset();
  };

  const handleCreateClassroom = async (data: z.infer<typeof prodiClassroomSchema>) => {
    try {
      setIsPending(true);
      const {
        class_cover,
        class_name,
        day,
        room_number,
        class_start,
        class_end,
        term,
        prodi,
        tahun_ajaran,
        dosen_id,
      } = data;
      const timeStartDateObj = dayjs.tz(`2010-10-10 ${class_start}`, "Asia/Jakarta");
      const timeEndDateObj = dayjs.tz(`2010-10-10 ${class_end}`, "Asia/Jakarta");
      await classroomServices.create({
        class_cover,
        class_name,
        term: Number(term),
        day: parseInt(`${day}`),
        room_number: Number(room_number),
        class_start: timeStartDateObj.toISOString(),
        class_end: timeEndDateObj.toISOString(),
        prodi,
        tahun_ajaran,
        dosen_id,
      });
      handleCloseForm();
      router.refresh();
    } catch (e) {
      createClassForm.setError("root", {
        message: (e as Error).message,
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    isOpen,
    isPending,
    setIsOpen,
    createClassForm,
    handleCreateClassroom,
    handleCloseForm,
    coverPreview,
    setCoverPreview,
  };
};

export default useCreateClassroom;
