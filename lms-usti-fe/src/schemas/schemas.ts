import { parseTime } from "@/lib/utils";
import z from "zod";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .email("Email tidak sesuai"),
  // .regex(
  //   /^[a-zA-Z0-9._%+-]+@sar\.ac\.id$/,
  //   "Email harus menggunakan domain @sar.ac.id"
  // )
  password: z
    .string({ required_error: "Password wajib diisi" })
    .min(1, "Password tidak boleh kosong"),
});

const resetSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .email("Email tidak sesuai")
    .regex(
      /^[a-zA-Z0-9._%+-]+@sar\.ac\.id$/,
      "Email harus menggunakan domain @sar.ac.id",
    ),
});

const newPasswordSchema = z.object({
  old_password: z.string({ required_error: "Password lama wajib diisi" }),
  new_password: z
    .string({ required_error: "Password baru wajib diisi" })
    .min(8, "Password minimal 8 karakter")
    .regex(
      /^(?=.*[A-Z])(?=.*\d).+$/,
      "Password harus mengandung minimal satu huruf besar dan satu angka",
    ),
  confirmPassword: z.string({
    required_error: "Konfirmasi password wajib diisi",
  }),
});

const newClassroomSchema = z
  .object({
    class_cover: z.string({ required_error: "Cover kelas harus dipilih" }),
    class_name: z.string({ required_error: "Nama Kelas wajib diisi" }),
    room_number: z.coerce
      .number({ required_error: "Ruang wajib diisi" })
      .nonnegative("Ruang tidak boleh negatif"),
    term: z.coerce.number({ required_error: "Semester Wajib diisi" }),
    day: z.string({ required_error: "Hari wajib dipilih" }),
    class_start: z.string({ required_error: "Jam mulai kelas wajib diisi" }),
    class_end: z.string({ required_error: "Jam selesai kelas wajib diisi" }),
  })
  .refine(
    (data) => {
      return data.class_start < data.class_end;
    },
    {
      message: "Jam selesai kelas harus lebih besar dari jam mulai kelas",
      path: ["time_end"],
    },
  );

const editClassroomSchema = z
  .object({
    class_cover: z
      .string({ required_error: "Cover kelas harus dipilih" })
      .optional(),
    class_name: z
      .string({ required_error: "Nama Kelas wajib diisi" })
      .optional(),
    term: z
      .string({
        required_error: "Semester harus diisi",
      })
      .optional(),
    room_number: z.string({ required_error: "Ruang wajib diisi" }).optional(),
    day: z.string({ required_error: "Hari wajib dipilih" }).optional(),
    class_start: z
      .string({ required_error: "Jam mulai kelas wajib diisi" })
      .optional(),
    class_end: z
      .string({ required_error: "Jam selesai kelas wajib diisi" })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.class_start && data.class_end) {
        return parseTime(data.class_start) < parseTime(data.class_end);
      }
    },
    {
      message: "Jam selesai kelas harus lebih besar dari jam mulai kelas",
      path: ["time_end"],
    },
  );

const joinClassroomSchema = z.object({
  classroom_code: z.string().min(4, "Kode kelas wajib diisi"),
});

const newAnnouncementSchema = z.object({
  title: z.string({ required_error: "Judul wajib diisi" }),
  content: z
    .string()
    .refine((val) => val.trim() !== "" && val !== "<p><br></p>", {
      message: "Konten wajib diisi",
    }),
});

const AttachmentSchema = z.object({
  name: z.string(),
  type: z.enum(["FILE", "VIDEO", "LINK"]),
  url: z.string(),
  unique_name: z.string(),
});

const newMaterialSchema = z.object({
  title: z.string({ required_error: "Judul wajib diisi" }),
  description: z
    .string()
    .transform((val) => {
      if (!val || val.trim() === "" || val === "<p><br></p>") {
        return null; // ubah jadi null
      }
      return val;
    })
    .nullable()
    .optional(),
  attachments: z.array(AttachmentSchema).optional(),
});

export {
  loginSchema,
  resetSchema,
  newPasswordSchema,
  joinClassroomSchema,
  newClassroomSchema,
  newAnnouncementSchema,
  editClassroomSchema,
  newMaterialSchema,
};
