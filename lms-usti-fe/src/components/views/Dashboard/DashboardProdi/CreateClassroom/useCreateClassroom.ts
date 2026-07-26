"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toISOTime } from "@/lib/utils";
import { toast } from "sonner";
import { createClassroom } from "@/actions/classroom";

const prodiClassroomSchema = z.object({
  class_name: z.string({ required_error: "Nama Kelas wajib diisi" }).min(1, "Nama Kelas wajib diisi"),
  room_number: z
    .string({ required_error: "Ruang wajib diisi" })
    .min(1, "Ruang wajib diisi")
    .regex(/^\d+$/, "Ruang wajib diisi"),
  term: z
    .string({ required_error: "Semester wajib diisi" })
    .min(1, "Semester wajib diisi")
    .regex(/^\d+$/, "Semester wajib diisi"),
  day: z.string({ required_error: "Hari wajib dipilih" }).min(1, "Hari wajib dipilih"),
  class_start: z.string({ required_error: "Jam mulai kelas wajib diisi" }).min(1, "Jam mulai kelas wajib diisi"),
  class_end: z.string({ required_error: "Jam selesai kelas wajib diisi" }).min(1, "Jam selesai kelas wajib diisi"),
  prodi: z.string({ required_error: "Program studi wajib dipilih" }).min(1, "Program studi wajib dipilih"),
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
    path: ["class_end"],
  },
);

const useCreateClassroom = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const createClassForm = useForm({
    defaultValues: {
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
      const result = await createClassroom({
        class_cover: "basic",
        class_name,
        term: Number(term),
        day: parseInt(`${day}`),
        room_number: Number(room_number),
        class_start: toISOTime(class_start),
        class_end: toISOTime(class_end),
        prodi,
        tahun_ajaran,
        dosen_id,
      });
      if (result.success) {
        handleCloseForm();
        toast.success(result.message);
      } else {
        toast.error(result.error);
        createClassForm.setError("class_start", { message: result.error });
        createClassForm.setError("class_end", { message: result.error });
      }
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
  };
};

export default useCreateClassroom;
